/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HealingIcon from '@mui/icons-material/Healing';
import HotelIcon from '@mui/icons-material/Hotel';
import { Alert, Box, Button, Chip, FormControlLabel, Link, Stack, Switch, Typography } from '@mui/material';
import {
  Character,
  fetchCharacters,
  HealerCandidate,
  Injury,
  InjuryList,
  Panel,
  resolveCharacterCondition,
  ResourceBar,
  StatPill,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { isGameMaster as isGameMasterOf } from '../../../shared/permissions';
import { useStrategicNotify } from '../../../services/notify-service';
import { Bento, span } from '../sections/CharacterPanels';
import HealingLogList from './HealingLogList';
import InjuryFormDialog from './InjuryFormDialog';
import InjuryHealingDialog, { HealingStepId } from './InjuryHealingDialog';
import RestDialog from './RestDialog';
import {
  activeConditions,
  HERBALISM_SKILL,
  INJURY_GROUPS,
  isTreatable,
  MEDICINE_SKILL,
  skillBonus,
} from './health-rules';

/** Bonus of a skill the healer has not developed, as rmu-api-strategic applies it. */
const UNRANKED_SKILL_BONUS = -20;

const toHealer = (character: Character): HealerCandidate => ({
  id: character.id,
  name: character.name,
  medicine: skillBonus(character, MEDICINE_SKILL) ?? UNRANKED_SKILL_BONUS,
  herbalism: skillBonus(character, HERBALISM_SKILL) ?? UNRANKED_SKILL_BONUS,
  imageUrl: character.imageUrl,
  factionId: character.faction?.id,
  factionName: character.faction?.name,
});

/**
 * Health section of the character (spec 013 §6): hits, injury penalty and conditions, the injuries by status with
 * their healing dialog, passing time and the healing log.
 */
const CharacterHealthSection: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [gameCharacters, setGameCharacters] = useState<Character[]>([]);
  const [showHealed, setShowHealed] = useState(false);
  const [healing, setHealing] = useState<{ injuryId: string; step: HealingStepId }>();
  const [editing, setEditing] = useState<{ injury?: Injury }>();
  const [restOpen, setRestOpen] = useState(false);

  // Adding and editing injuries and resolving conditions are for the game master (the owner of the game).
  const isGameMaster = isGameMasterOf(auth, strategicGame);

  useEffect(() => {
    fetchCharacters(`gameId==${character.gameId}`, 0, 100, auth)
      .then((page) => setGameCharacters(page.content))
      .catch(notify.error);
  }, [character.gameId]);

  const healers: HealerCandidate[] = [
    toHealer(character),
    ...gameCharacters.filter((other) => other.id !== character.id && other.status !== 'dead').map(toHealer),
  ];
  // Their own injury penalties, which rmu-api-strategic adds to their Medicine roll (spec 022).
  const healerPenalties: Record<string, number> = Object.fromEntries(
    [character, ...gameCharacters.filter((other) => other.id !== character.id)].map((healer) => [
      healer.id,
      healer.healthSummary?.injuryPenalty || 0,
    ])
  );

  const injuries = character.injuries || [];
  const conditions = activeConditions(character);
  const summary = character.healthSummary;
  const dead = character.status === 'dead';
  const groups = INJURY_GROUPS.filter((status) => status !== 'healed' || showHealed);
  const visibleCount = injuries.filter((injury) => showHealed || injury.status !== 'healed').length;

  const resolveCondition = (conditionId: string) =>
    resolveCharacterCondition(character.id, conditionId, auth).then(setCharacter).catch(notify.error);

  const renderGameLink = (tacticalGameId: string, label: string) => (
    <Link component={RouterLink} to={`/tactical/games/view/${tacticalGameId}`} underline="hover">
      {label}
    </Link>
  );

  const renderActions = (injury: Injury) =>
    !dead && isTreatable(injury) ? (
      <Button
        size="small"
        startIcon={<HealingIcon />}
        onClick={() => setHealing({ injuryId: injury.id, step: injury.treatments.length > 0 ? 'recovery' : 'healer' })}
      >
        {t('heal')}
      </Button>
    ) : undefined;

  return (
    <Bento>
      <Box sx={span(12, 12)}>
        <Panel
          title={t('health')}
          extra={
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<HotelIcon />} disabled={dead} onClick={() => setRestOpen(true)}>
                {t('pass-time')}
              </Button>
              {isGameMaster && (
                <Button size="small" startIcon={<AddIcon />} onClick={() => setEditing({})}>
                  {t('add-injury')}
                </Button>
              )}
            </Stack>
          }
        >
          <Stack spacing={1.5}>
            {dead && <Alert severity="error">{t('character-dead-alert')}</Alert>}
            <ResourceBar label={t('hit-points')} current={character.hp.current} max={character.hp.max} kind="hp" />
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
              <StatPill label={t('injury-penalty')} value={summary?.injuryPenalty ?? 0} signed />
              <StatPill label={t('active-injuries')} value={summary?.activeInjuries ?? 0} />
              {(summary?.bleeding ?? 0) > 0 && (
                <StatPill label={t('bleeding')} value={t('bleeding-per-round-value', { value: summary?.bleeding })} />
              )}
            </Stack>
            {conditions.length > 0 && (
              <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {conditions.map((condition) => (
                  <Chip
                    key={condition.id}
                    color={condition.status === 'dead' ? 'error' : 'warning'}
                    label={[
                      t(`condition-${condition.status}`),
                      condition.source.tacticalGameName,
                      condition.description,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    onDelete={isGameMaster ? () => resolveCondition(condition.id) : undefined}
                    title={isGameMaster ? t('resolve-condition') : undefined}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Panel>
      </Box>

      <Box sx={span(12, 7, 8)}>
        <Panel
          title={t('injuries')}
          extra={
            <FormControlLabel
              control={<Switch size="small" checked={showHealed} onChange={(_, checked) => setShowHealed(checked)} />}
              label={t('show-healed-injuries')}
            />
          }
        >
          {visibleCount === 0 ? (
            <Typography color="text.secondary">{t('no-injuries')}</Typography>
          ) : (
            <Stack spacing={2}>
              {groups.map((status) => {
                const items = injuries.filter((injury) => injury.status === status);
                if (items.length === 0) return null;
                return (
                  <Stack key={status} spacing={1}>
                    <Typography variant="overline" color="text.secondary">
                      {t(`injury-group-${status}`, { count: items.length })}
                    </Typography>
                    <InjuryList
                      injuries={items}
                      showHealed={status === 'healed'}
                      renderActions={renderActions}
                      onEdit={isGameMaster ? (injury) => setEditing({ injury }) : undefined}
                      renderGameLink={renderGameLink}
                    />
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Panel>
      </Box>

      <Box sx={span(12, 5, 4)}>
        <Panel title={t('healing-log')}>
          <HealingLogList character={character} />
        </Panel>
      </Box>

      <InjuryHealingDialog
        character={character}
        injuryId={healing?.injuryId}
        initialStep={healing?.step}
        healers={healers}
        healerPenalties={healerPenalties}
        open={!!healing}
        onClose={() => setHealing(undefined)}
        onUpdated={setCharacter}
      />
      <InjuryFormDialog
        character={character}
        injury={editing?.injury}
        open={!!editing}
        onClose={() => setEditing(undefined)}
        onSaved={setCharacter}
      />
      <RestDialog character={character} open={restOpen} onClose={() => setRestOpen(false)} onRested={setCharacter} />
    </Bento>
  );
};

export default CharacterHealthSection;
