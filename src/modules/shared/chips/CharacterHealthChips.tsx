import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HealingIcon from '@mui/icons-material/Healing';
import { Chip, Stack } from '@mui/material';
import { Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';

export type HealthChip = { key: string; label: string; color: 'error' | 'warning' | 'default' };

/** Health chips of a character: dead, unconscious and active injuries with their total penalty (spec 013 §6.6). */
export const healthChips = (character: Character, t: TFunction): HealthChip[] => {
  const chips: HealthChip[] = [];
  const conditions = (character.conditions || []).filter((condition) => !condition.resolvedAt);
  const dead = character.status === 'dead' || conditions.some((condition) => condition.status === 'dead');
  if (dead) chips.push({ key: 'dead', label: t('dead'), color: 'error' });
  else {
    const unconscious = conditions.find(
      (condition) => condition.status === 'unconscious' || condition.status === 'permanent-unconscious'
    );
    if (unconscious) chips.push({ key: 'unconscious', label: t(`condition-${unconscious.status}`), color: 'warning' });
  }
  const summary = character.healthSummary;
  const activeInjuries =
    summary?.activeInjuries ??
    (character.injuries || []).filter((injury) => injury.status === 'active' || injury.status === 'recovering').length;
  if (activeInjuries > 0) {
    chips.push({
      key: 'injuries',
      label: t('health-injuries-chip', { count: activeInjuries, penalty: summary?.injuryPenalty ?? 0 }),
      color: 'warning',
    });
  }
  return chips;
};

/** The health chips in a row; nothing when the character is healthy. */
const CharacterHealthChips: FC<{ character: Character; onClick?: () => void }> = ({ character, onClick }) => {
  const { t } = useTranslation();
  const chips = healthChips(character, t);
  if (chips.length === 0) return null;
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          size="small"
          color={chip.color}
          icon={chip.key === 'injuries' ? <HealingIcon /> : undefined}
          label={chip.label}
          onClick={onClick}
        />
      ))}
    </Stack>
  );
};

export default CharacterHealthChips;
