import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import {
  Character,
  CharacterAttack,
  formatBonus,
  ResourceBar,
  StatPill,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** A label and its value on one line. */
export const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.5, gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {value}
    </Typography>
  </Stack>
);

// The grid moved to the shared layout (campaign and faction views use it too); re-exported for the sections.
export { Bento, span } from '../../../shared/layout/Bento';

/** Armor type: the single AT, or the AT of head / body / arms / legs. */
export const armorLabel = (character: Character) => {
  const { armor } = character.defense;
  if (armor.at) return `${armor.at}`;
  return [armor.headAt, armor.bodyAt, armor.armsAt, armor.legsAt].map((at) => at ?? '-').join('/');
};

/** Melee range in feet, with its board distance when the game scales the board. */
export const formatMeleeRange = (attack: CharacterAttack, strategicGame?: StrategicGame) => {
  if (!attack.meleeRange) return '-';
  const scale = strategicGame?.options?.boardScaleMultiplier;
  if (!scale || scale === 1) return `${attack.meleeRange}'`;
  const scaled = Math.round(attack.meleeRange * scale * 10) / 10;
  return `${attack.meleeRange}' (${scaled}")`;
};

/** Fumble range, with the weapon's own range when they differ. */
export const formatFumble = (attack: CharacterAttack) =>
  attack.fumble === attack.weaponFumble ? `${attack.fumble}` : `${attack.fumble} (${attack.weaponFumble})`;

export const DefensePanel = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const { armor, shield } = character.defense;
  return (
    <>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <StatPill label={t('db')} value={character.defense.defensiveBonus} signed />
        <StatPill label={t('at')} value={armorLabel(character)} />
        {shield && <StatPill label={t('shield-db')} value={shield.db} signed />}
      </Stack>
      <Row label={t('head')} value={armor.headAt ?? '-'} />
      <Row label={t('body')} value={armor.bodyAt ?? '-'} />
      <Row label={t('arms')} value={armor.armsAt ?? '-'} />
      <Row label={t('legs')} value={armor.legsAt ?? '-'} />
      {shield && <Row label={t('shield-block-count')} value={shield.blockCount} />}
      {Object.entries(character.defense.modifiers ?? {})
        .filter(([, value]) => value !== 0)
        .map(([key, value]) => (
          <Row key={key} label={t(key)} value={formatBonus(value)} />
        ))}
    </>
  );
};

export const LoadPanel = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const { equipment } = character;
  return (
    <>
      <ResourceBar
        label={t('weight-allowance')}
        current={equipment.weight}
        max={equipment.weightAllowance}
        kind="fatigue"
      />
      <Box sx={{ mt: 1 }}>
        <Row label={t('maneuver-penalty')} value={formatBonus(equipment.maneuverPenalty)} />
        <Row label={t('ranged-penalty')} value={formatBonus(equipment.rangedPenalty)} />
        <Row label={t('encumbrance')} value={formatBonus(equipment.encumbrancePenalty)} />
      </Box>
    </>
  );
};
