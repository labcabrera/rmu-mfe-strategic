/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import GrassIcon from '@mui/icons-material/Grass';
import HealingIcon from '@mui/icons-material/Healing';
import HotelIcon from '@mui/icons-material/Hotel';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ScienceIcon from '@mui/icons-material/Science';
import SpaIcon from '@mui/icons-material/Spa';
import { Alert, Box, Button, Chip, FormControlLabel, Link, Stack, Switch } from '@mui/material';
import {
  Character,
  ChipRow,
  EmptyState,
  fetchCharacters,
  HealerCandidate,
  Injury,
  InjuryList,
  Panel,
  removeCharacterTemporaryModifier,
  resolveCharacterCondition,
  ResourceBar,
  SectionLabel,
  StatPill,
  StrategicGame,
  TemporaryModifier,
  TemporaryModifierList,
  updateCharacterInjury,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { isGameMaster as isGameMasterOf } from '../../../shared/permissions';
import { Bento, span } from '../sections/CharacterPanels';
import AmputationDialog from './AmputationDialog';
import AntidoteDialog from './AntidoteDialog';
import HealingLogList from './HealingLogList';
import HerbSearchDialog from './HerbSearchDialog';
import InjuryFormDialog from './InjuryFormDialog';
import InjuryHealingDialog, { HealingStepId } from './InjuryHealingDialog';
import PoisonCharacterDialog from './PoisonCharacterDialog';
import RestDialog from './RestDialog';
import StrenuousFailureDialog from './StrenuousFailureDialog';
import UseHerbDialog from './UseHerbDialog';
import {
  activeConditions,
  canFailStrenuous,
  HERBALISM_SKILL,
  INJURY_GROUPS,
  isPoisoning,
  isTreatable,
  MEDICINE_SKILL,
  needsNewTreatment,
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
  const [poisonOpen, setPoisonOpen] = useState(false);
  const [antidoteFor, setAntidoteFor] = useState<Injury>();
  const [herbUseOpen, setHerbUseOpen] = useState(false);
  const [herbSearchOpen, setHerbSearchOpen] = useState(false);
  const [removingModifierId, setRemovingModifierId] = useState<string | null>(null);
  const [clearingLimitsId, setClearingLimitsId] = useState<string | null>(null);
  const [amputationOpen, setAmputationOpen] = useState(false);
  const [strenuousFor, setStrenuousFor] = useState<Injury>();

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
  const lostLimbs = character.lostLimbs || [];
  const groups = INJURY_GROUPS.filter((status) => status !== 'healed' || showHealed);
  const visibleCount = injuries.filter((injury) => showHealed || injury.status !== 'healed').length;

  const resolveCondition = (conditionId: string) =>
    resolveCharacterCondition(character.id, conditionId, auth).then(setCharacter).catch(notify.error);

  // Workspace spec 068: lasting morale and fear RR modifiers, whose expiry counts from the campaign day (spec 065).
  const temporaryModifiers = character.temporaryModifiers || [];
  const currentGameDay = strategicGame?.calendar?.currentDay;

  const removeModifier = (modifier: TemporaryModifier) => {
    setRemovingModifierId(modifier.id);
    removeCharacterTemporaryModifier(character.id, modifier.id, auth)
      .then(setCharacter)
      .catch(notify.error)
      .finally(() => setRemovingModifierId(null));
  };

  // The game master takes off the limits of a splint or a cast before the injury heals (workspace spec 068).
  const clearLimits = (injury: Injury) => {
    setClearingLimitsId(injury.id);
    updateCharacterInjury(character.id, injury.id, { limits: null }, auth)
      .then(setCharacter)
      .catch(notify.error)
      .finally(() => setClearingLimitsId(null));
  };

  const renderGameLink = (tacticalGameId: string, label: string) => (
    <Link component={RouterLink} to={`/tactical/games/view/${tacticalGameId}`} underline="hover">
      {label}
    </Link>
  );

  const renderActions = (injury: Injury) => {
    const care = renderCareActions(injury);
    const clear =
      isGameMaster && injury.limits && injury.status !== 'healed' ? (
        <Button
          size="small"
          startIcon={<LockOpenIcon />}
          disabled={clearingLimitsId === injury.id}
          onClick={() => clearLimits(injury)}
        >
          {t('injury-limits-clear')}
        </Button>
      ) : undefined;
    // Workspace spec 079, C2: a failed strenuous activity reopens a treated injury
    const strenuous =
      isGameMaster && !dead && canFailStrenuous(injury) ? (
        <Button size="small" startIcon={<DirectionsRunIcon />} onClick={() => setStrenuousFor(injury)}>
          {t('strenuous-failure')}
        </Button>
      ) : undefined;
    const retreat =
      injury.status === 'active' && needsNewTreatment(injury) ? (
        <Chip size="small" color="warning" label={t('strenuous-failure-retreat')} />
      ) : undefined;
    if (!care && !clear && !strenuous && !retreat) return undefined;
    return (
      <>
        {retreat}
        {care}
        {strenuous}
        {clear}
      </>
    );
  };

  const renderCareActions = (injury: Injury) =>
    !dead && isPoisoning(injury) ? (
      <Button size="small" startIcon={<ScienceIcon />} onClick={() => setAntidoteFor(injury)}>
        {t('antidote')}
      </Button>
    ) : !dead && isTreatable(injury) ? (
      <Button
        size="small"
        startIcon={<HealingIcon />}
        onClick={() =>
          setHealing({
            injuryId: injury.id,
            step: injury.treatments.length > 0 && !needsNewTreatment(injury) ? 'recovery' : 'healer',
          })
        }
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
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button size="small" startIcon={<HotelIcon />} disabled={dead} onClick={() => setRestOpen(true)}>
                {t('pass-time')}
              </Button>
              <Button size="small" startIcon={<SpaIcon />} disabled={dead} onClick={() => setHerbUseOpen(true)}>
                {t('herb-use')}
              </Button>
              <Button size="small" startIcon={<GrassIcon />} disabled={dead} onClick={() => setHerbSearchOpen(true)}>
                {t('herb-search')}
              </Button>
              {isGameMaster && (
                <Button size="small" startIcon={<ScienceIcon />} disabled={dead} onClick={() => setPoisonOpen(true)}>
                  {t('poison-character')}
                </Button>
              )}
              {isGameMaster && (
                <Button
                  size="small"
                  startIcon={<ContentCutIcon />}
                  disabled={dead}
                  onClick={() => setAmputationOpen(true)}
                >
                  {t('amputation')}
                </Button>
              )}
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
              {/* Spec 077 (§5.5): accumulated fatigue, 0-50, one point recovered per minute of rest */}
              <StatPill
                label={t('fatigue-penalty')}
                value={-Math.abs(character.endurance?.fatiguePenalty ?? 0)}
                signed
              />
              {(summary?.bleeding ?? 0) > 0 && (
                <StatPill label={t('bleeding')} value={t('bleeding-per-round-value', { value: summary?.bleeding })} />
              )}
            </Stack>
            {conditions.length > 0 && (
              <ChipRow>
                {conditions.map((condition) => (
                  <Chip
                    key={condition.id}
                    color={condition.status === 'dead' ? 'error' : 'warning'}
                    label={[
                      t(`condition-${condition.status}`),
                      condition.source.tacticalGameName,
                      condition.description,
                      // Workspace spec 079, C6: the day of the campaign of a death
                      condition.gameDay !== undefined ? t('campaign-day', { day: condition.gameDay }) : undefined,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    onDelete={isGameMaster ? () => resolveCondition(condition.id) : undefined}
                    title={isGameMaster ? t('resolve-condition') : undefined}
                  />
                ))}
              </ChipRow>
            )}
            {/* Workspace spec 079, C1: limbs lost for good */}
            {lostLimbs.length > 0 && (
              <ChipRow>
                {lostLimbs.map((limb) => (
                  <Chip
                    key={`${limb.location}-${limb.side}`}
                    color="error"
                    variant="outlined"
                    label={[
                      t('lost-limb-label', { location: t(limb.location), side: t(`side-${limb.side}`) }),
                      limb.cause ? t(`lost-limb-cause-${limb.cause}`) : undefined,
                      limb.gameDay !== undefined ? t('campaign-day', { day: limb.gameDay }) : undefined,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    title={t(`lost-limb-${limb.location}-help`)}
                  />
                ))}
              </ChipRow>
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
            <EmptyState dense title={t('no-injuries')} />
          ) : (
            <Stack spacing={2}>
              {groups.map((status) => {
                const items = injuries.filter((injury) => injury.status === status);
                if (items.length === 0) return null;
                return (
                  <Stack key={status} spacing={1}>
                    <SectionLabel>{t(`injury-group-${status}`, { count: items.length })}</SectionLabel>
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
        <Stack spacing={2}>
          {temporaryModifiers.length > 0 && (
            <Panel title={t('temporary-modifiers')}>
              <TemporaryModifierList
                modifiers={temporaryModifiers}
                currentGameDay={currentGameDay}
                onRemove={isGameMaster ? removeModifier : undefined}
                removingId={removingModifierId}
              />
            </Panel>
          )}
          <Panel title={t('healing-log')}>
            <HealingLogList character={character} />
          </Panel>
        </Stack>
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
      <PoisonCharacterDialog
        character={character}
        open={poisonOpen}
        onClose={() => setPoisonOpen(false)}
        onUpdated={setCharacter}
      />
      <AntidoteDialog
        character={character}
        injury={antidoteFor}
        open={!!antidoteFor}
        onClose={() => setAntidoteFor(undefined)}
        onUpdated={setCharacter}
      />
      <UseHerbDialog
        characterId={character.id}
        open={herbUseOpen}
        onClose={() => setHerbUseOpen(false)}
        onDone={(result) => {
          setHerbUseOpen(false);
          setCharacter((current) => current && { ...current, hp: { ...current.hp, current: result.hp.current } });
        }}
      />
      <HerbSearchDialog character={character} open={herbSearchOpen} onClose={() => setHerbSearchOpen(false)} />
      <RestDialog character={character} open={restOpen} onClose={() => setRestOpen(false)} onRested={setCharacter} />
      <AmputationDialog
        character={character}
        healers={healers}
        healerPenalties={healerPenalties}
        open={amputationOpen}
        onClose={() => setAmputationOpen(false)}
        onUpdated={setCharacter}
      />
      <StrenuousFailureDialog
        character={character}
        injury={strenuousFor}
        open={!!strenuousFor}
        onClose={() => setStrenuousFor(undefined)}
        onUpdated={setCharacter}
      />
    </Bento>
  );
};

export default CharacterHealthSection;
