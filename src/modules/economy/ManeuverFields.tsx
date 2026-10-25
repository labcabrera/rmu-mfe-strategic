import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  Character,
  CharacterSkill,
  ItemManeuverDto,
  MANEUVER_DIFFICULTIES,
  NumericInput,
  OPEN_D100,
  RollField,
  SelectDifficulty,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** What the game master fills for a maneuver of the market or the workshop. */
export type ManeuverValue = {
  skillKey: string;
  /** Typed bonus, when the character has no such skill or it is an NPC without a sheet. */
  bonus: number | null;
  difficulty?: string;
  modifier: number | null;
  roll: number | null;
  unmodifiedRoll?: number;
};

export const emptyManeuver = (skillKey = '', difficulty?: string): ManeuverValue => ({
  skillKey,
  bonus: null,
  difficulty,
  modifier: 0,
  roll: null,
});

export const skillKeyOf = (skill: Pick<CharacterSkill, 'skillId' | 'specialization'>) =>
  `${skill.skillId}::${skill.specialization ?? ''}`;

const parseSkillKey = (key: string) => {
  const [skillId, specialization] = key.split('::');
  return { skillId: skillId || undefined, specialization: specialization || undefined };
};

/** First skill of the character among the preferred ones, as a key of the selector. */
export const defaultSkillKey = (character: Character | undefined, preferred: string[]): string => {
  const skill = preferred
    .map((id) => character?.skills.find((s) => s.skillId === id || s.specialization === id))
    .find(Boolean);
  return skill ? skillKeyOf(skill) : '';
};

const skillOf = (character: Character | undefined, key: string) =>
  character?.skills.find((skill) => skillKeyOf(skill) === key);

/** Bonus the API will use: the typed one, or the one of the chosen skill. */
export const maneuverBonus = (character: Character | undefined, value: ManeuverValue): number | undefined =>
  value.bonus ?? skillOf(character, value.skillKey)?.totalBonus;

export const maneuverTotal = (character: Character | undefined, value: ManeuverValue, extra = 0): number | null => {
  const bonus = maneuverBonus(character, value);
  if (value.roll === null || bonus === undefined) return null;
  const difficulty = MANEUVER_DIFFICULTIES.find((d) => d.key === value.difficulty)?.value ?? 0;
  return value.roll + bonus + difficulty + (value.modifier ?? 0) + extra;
};

export const isManeuverReady = (character: Character | undefined, value: ManeuverValue) =>
  value.roll !== null && maneuverBonus(character, value) !== undefined;

/** The maneuver as the API takes it. */
export const toManeuverDto = (value: ManeuverValue): ItemManeuverDto => ({
  ...parseSkillKey(value.skillKey),
  ...(value.bonus !== null ? { bonus: value.bonus } : {}),
  ...(value.difficulty ? { difficulty: value.difficulty } : {}),
  ...(value.modifier ? { modifiers: [{ key: 'custom', value: value.modifier }] } : {}),
  roll: value.roll ?? 0,
  ...(value.unmodifiedRoll !== undefined ? { unmodifiedRoll: value.unmodifiedRoll } : {}),
});

/**
 * Skill, bonus, difficulty, modifier and open-ended roll of a maneuver (Trading, crafting, repair). The skills of the
 * character that match `preferred` are listed first.
 */
const ManeuverFields: FC<{
  character?: Character;
  value: ManeuverValue;
  onChange: (value: ManeuverValue) => void;
  preferred?: string[];
  showDifficulty?: boolean;
  /** Modifiers the API adds by itself, shown in the total (the damage of the item in a repair). */
  extra?: { label: string; value: number };
}> = ({ character, value, onChange, preferred = [], showDifficulty = false, extra }) => {
  const { t } = useTranslation();
  const skills = useMemo(() => {
    const rank = (skill: CharacterSkill) => {
      const index = preferred.findIndex((id) => skill.skillId === id || skill.specialization === id);
      return index < 0 ? preferred.length : index;
    };
    return [...(character?.skills ?? [])].sort((a, b) => rank(a) - rank(b) || t(a.skillId).localeCompare(t(b.skillId)));
  }, [character, preferred, t]);
  const skill = skillOf(character, value.skillKey);
  const total = maneuverTotal(character, value, extra?.value ?? 0);

  return (
    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          label={t('skill')}
          value={skill ? value.skillKey : ''}
          onChange={(event) => onChange({ ...value, skillKey: event.target.value })}
        >
          <MenuItem value="">{t('none')}</MenuItem>
          {skills.map((s) => (
            <MenuItem key={s.id ?? skillKeyOf(s)} value={skillKeyOf(s)}>
              {`${t(s.skillId)}${s.specialization ? `: ${t(s.specialization)}` : ''} (${s.totalBonus})`}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <NumericInput
          label={t('bonus')}
          placeholder={skill ? `${skill.totalBonus}` : undefined}
          value={value.bonus}
          onChange={(bonus) => onChange({ ...value, bonus })}
          integer
          allowNegatives
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <NumericInput
          label={t('custom-modifier')}
          value={value.modifier}
          onChange={(modifier) => onChange({ ...value, modifier })}
          integer
          allowNegatives
        />
      </Grid>
      {showDifficulty && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectDifficulty
            label={t('difficulty')}
            value={value.difficulty ?? ''}
            onChange={(difficulty) => onChange({ ...value, difficulty: difficulty.key })}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <RollField
          spec={OPEN_D100}
          value={value.roll}
          onChange={(roll) => onChange({ ...value, roll: roll.total, unmodifiedRoll: roll.unmodified })}
        />
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          {extra && extra.value !== 0 && (
            <Typography variant="body2" color="text.secondary">{`${extra.label}: ${extra.value}`}</Typography>
          )}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {`${t('total')}: ${total ?? '—'}`}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ManeuverFields;
