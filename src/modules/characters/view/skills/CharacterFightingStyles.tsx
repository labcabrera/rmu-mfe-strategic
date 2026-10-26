import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import UndoIcon from '@mui/icons-material/UndoOutlined';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  addStyleAbility,
  Character,
  CharacterSkill,
  fetchFightingStyles,
  FightingStyle,
  FightingStyles,
  isFightingStyleSkill,
  removeStyleAbility,
  StrategicGame,
  StyleAbility,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { isGameMaster } from '../../../shared/permissions';

/** Fighting styles of the character (spec 032): ranks of the style skills allocated to the abilities of the style. */
export default function CharacterFightingStyles({
  character,
  setCharacter,
  strategicGame,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [catalog, setCatalog] = useState<FightingStyles>();
  const styleSkills = character.skills.filter((s) => isFightingStyleSkill(s.skillId) && !!s.specialization);

  useEffect(() => {
    if (styleSkills.length === 0 || catalog) return;
    fetchFightingStyles(auth)
      .then(setCatalog)
      .catch((error) => notify.error(error));
  }, [styleSkills.length]);

  if (styleSkills.length === 0) return null;

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      <Typography variant="h6" color="primary">
        {t('fighting-styles')}
      </Typography>
      {styleSkills.map((skill) => (
        <StyleCard
          key={`${skill.skillId}@${skill.specialization}`}
          skill={skill}
          style={catalog?.styles.find((s) => s.id === skill.specialization && s.skillId === skill.skillId)}
          abilities={catalog?.abilities || []}
          character={character}
          setCharacter={setCharacter}
          canUndo={isGameMaster(auth, strategicGame)}
        />
      ))}
    </Stack>
  );
}

function StyleCard({
  skill,
  style,
  abilities,
  character,
  setCharacter,
  canUndo,
}: {
  skill: CharacterSkill;
  style?: FightingStyle;
  abilities: StyleAbility[];
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  canUndo: boolean;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const selections = skill.styleAbilities || [];
  const freeRanks = skill.styleFreeRanks ?? skill.ranks;

  const add = (abilityId: string) =>
    addStyleAbility(character.id, skill.skillId, skill.specialization!, abilityId, auth)
      .then(setCharacter)
      .catch((error) => notify.error(error));

  const remove = (abilityId: string) =>
    removeStyleAbility(character.id, skill.skillId, skill.specialization!, abilityId, auth)
      .then(setCharacter)
      .catch((error) => notify.error(error));

  // The server checks the skills and traits required; here only what the sheet already knows
  const blockedBy = (ability: StyleAbility | undefined, cost: number, times: number): string | null => {
    if (!ability) return t('loading');
    if (times > 0 && (!ability.repeatable || (ability.maxTimes !== null && times >= ability.maxTimes))) {
      return t('style-ability-max-times');
    }
    if (freeRanks < cost) return t('style-ability-no-ranks');
    const missing = ability.requiresAbilities.find((id) => !selections.some((s) => s.abilityId === id));
    if (missing) return t('style-ability-requires', { ability: t(`style-ability-${missing}`) });
    return null;
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
        <Typography variant="subtitle1">
          <b>{t(skill.specialization!)}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(skill.skillId)}
        </Typography>
        <Chip size="small" label={t('style-ranks', { ranks: skill.ranks })} />
        <Tooltip title={t('style-free-ranks-help')}>
          <Chip
            size="small"
            color={freeRanks > 0 ? 'success' : 'default'}
            label={t('style-free-ranks-chip', { ranks: freeRanks, bonus: skill.styleFreeRanksBonus ?? 0 })}
          />
        </Tooltip>
      </Stack>
      {!style ? (
        <Typography variant="body2" color="text.secondary">
          {t('fighting-style-not-found')}
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('style-ability')}</TableCell>
              <TableCell align="right">{t('cost')}</TableCell>
              <TableCell align="right">{t('selected')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {style.abilities.map((entry) => {
              const ability = abilities.find((a) => a.id === entry.abilityId);
              const times = selections.find((s) => s.abilityId === entry.abilityId)?.times ?? 0;
              const blocked = blockedBy(ability, entry.cost, times);
              return (
                <TableRow key={entry.abilityId} selected={times > 0}>
                  <TableCell>{t(`style-ability-${entry.abilityId}`)}</TableCell>
                  <TableCell align="right">{entry.cost}</TableCell>
                  <TableCell align="right">{times > 0 ? `×${times}` : '-'}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={blocked ?? t('style-ability-add')}>
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label={t('style-ability-add')}
                          disabled={!!blocked}
                          onClick={() => add(entry.abilityId)}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {canUndo && times > 0 && (
                      <Tooltip title={t('style-ability-undo')}>
                        <IconButton
                          size="small"
                          color="warning"
                          aria-label={t('style-ability-undo')}
                          onClick={() => remove(entry.abilityId)}
                        >
                          <UndoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
