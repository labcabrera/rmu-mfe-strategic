import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HealingIcon from '@mui/icons-material/Healing';
import { Chip, Stack } from '@mui/material';
import { Character, effectColor, effectIcon, StatusBadge } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';

export type HealthChip = {
  key: string;
  /** Status of the chip (`dead`, `unconscious`, `permanent-unconscious`) or `injuries`. */
  status: string;
  label: string;
  color: 'error' | 'warning' | 'default';
  /** Injuries only: how many are active and their total penalty (0 when they do not penalize). */
  count?: number;
  penalty?: number;
};

/**
 * Health chips of a character: dead, unconscious and active injuries with their total penalty (spec 013 §6.6). The
 * states take the color the combat effects use, so a status looks the same everywhere (spec 017).
 */
export const healthChips = (character: Character, t: TFunction): HealthChip[] => {
  const chips: HealthChip[] = [];
  const conditions = (character.conditions || []).filter((condition) => !condition.resolvedAt);
  const dead = character.status === 'dead' || conditions.some((condition) => condition.status === 'dead');
  if (dead) chips.push({ key: 'dead', status: 'dead', label: t('dead'), color: effectColor('dead') });
  else {
    const unconscious = conditions.find(
      (condition) => condition.status === 'unconscious' || condition.status === 'permanent-unconscious'
    );
    if (unconscious) {
      chips.push({
        key: 'unconscious',
        status: unconscious.status,
        label: t(`condition-${unconscious.status}`),
        color: effectColor(unconscious.status),
      });
    }
  }
  const summary = character.healthSummary;
  const activeInjuries =
    summary?.activeInjuries ??
    (character.injuries || []).filter((injury) => injury.status === 'active' || injury.status === 'recovering').length;
  if (activeInjuries > 0) {
    const penalty = summary?.injuryPenalty ?? 0;
    chips.push({
      key: 'injuries',
      status: 'injuries',
      // A penalty of 0 says nothing: only the count then.
      label: penalty
        ? t('health-injuries-chip', { count: activeInjuries, penalty })
        : t('injuries-n', { count: activeInjuries }),
      color: 'warning',
      count: activeInjuries,
      penalty,
    });
  }
  return chips;
};

/**
 * The health chips in a row; nothing when the character is healthy. `compact` (tables and list cards) shows badges:
 * the status icon and abbreviation, or the injury count and penalty, with the full text on hover or tap.
 */
const CharacterHealthChips: FC<{ character: Character; onClick?: () => void; variant?: 'full' | 'compact' }> = ({
  character,
  onClick,
  variant = 'full',
}) => {
  const { t } = useTranslation();
  const chips = healthChips(character, t);
  if (chips.length === 0) return null;

  if (variant === 'compact') {
    return (
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {chips.map((chip) =>
          chip.key === 'injuries' ? (
            <StatusBadge
              key={chip.key}
              status="injuries"
              label={chip.label}
              abbr={`${chip.count}`}
              value={chip.penalty || undefined}
              detail={t('health-injuries-help')}
              color={chip.color}
              icon={<HealingIcon />}
            />
          ) : (
            <StatusBadge
              key={chip.key}
              status={chip.status}
              label={chip.label}
              detail={t(`effect-${chip.status}-help`, { defaultValue: '' }) || undefined}
              color={chip.color}
              avatar={effectIcon(chip.status)}
            />
          )
        )}
      </Stack>
    );
  }

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
