import { useTranslation } from 'react-i18next';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { Character, KeyValueList, KeyValueRow, Panel, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';

export function StatsPanel({ character }: { character: Character }) {
  const { t } = useTranslation();
  const eq = character.equipment;
  const over = eq.weight > eq.weightAllowance;
  const loadPercent = eq.weightAllowance > 0 ? Math.min((eq.weight / eq.weightAllowance) * 100, 100) : 100;
  const overload = eq.weight - eq.weightAllowance;

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  return (
    <Panel variant="outlined" title={t('equipment-stats')}>
      <Box>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2">{t('encumbrance')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }} color={over ? 'error.main' : 'text.primary'}>
            {`${eq.weight} / ${eq.weightAllowance} ${t('lbs')}`}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={loadPercent}
          color={over ? 'error' : 'primary'}
          sx={{ mt: 1, height: 8, borderRadius: (theme) => `${theme.radius.pill}px` }}
        />
      </Box>

      <StatGroup
        title={t('weight')}
        rows={[
          // Spec 077 (B1.5): the worn equipment counts too, worn armor scaled to the body it was made for
          ...(eq.load
            ? [
                { label: t('load-worn'), value: `${formatWeight(eq.load.worn)} ${t('lbs')}` },
                { label: t('load-carried'), value: `${formatWeight(eq.load.carried)} ${t('lbs')}` },
                { label: t('load-percent'), value: `${formatWeight(eq.load.percent)} %`, hint: t('load-percent-hint') },
              ]
            : []),
          ...(overload > 0
            ? [{ label: t('overload'), value: `${overload.toFixed(2)} ${t('lbs')}`, tone: 'danger' as const }]
            : []),
          { label: t('encumbrance-penalty'), value: eq.encumbrancePenalty, tone: 'penalty' },
          // Workspace spec 079, D2: Beast of Burden lowers the load penalty but not the one of the dodge
          ...(eq.dodgeEncumbrancePenalty !== undefined && eq.dodgeEncumbrancePenalty !== eq.encumbrancePenalty
            ? [
                {
                  label: t('dodge-encumbrance'),
                  value: eq.dodgeEncumbrancePenalty,
                  tone: 'penalty' as const,
                  hint: t('dodge-encumbrance-hint'),
                },
              ]
            : []),
        ]}
      />

      <StatGroup
        title={t('armor')}
        rows={[
          { label: t('armor-type'), value: getArmorType() },
          ...(eq.armorEncumbrance !== undefined
            ? [{ label: t('armor-encumbrance'), value: `${eq.armorEncumbrance} %`, hint: t('armor-encumbrance-hint') }]
            : []),
          { label: t('armor-base-penalty'), value: eq.baseManeuverPenalty, tone: 'penalty' },
          { label: t('maneuver-penalty'), value: eq.maneuverPenalty, tone: 'penalty' },
        ]}
      />

      <StatGroup
        title={t('penalties')}
        rows={[
          { label: t('ranged-penalty'), value: eq.rangedPenalty, tone: 'penalty' },
          { label: t('perception-penalty'), value: eq.perceptionPenalty ?? 0, tone: 'penalty' },
        ]}
      />

      <StatGroup
        title={t('movement')}
        rows={[
          { label: t('max-pace'), value: t(character.movement.maxPace) },
          ...(eq.movementBaseDifficulty
            ? [{ label: t('movement-base-difficulty'), value: t(`difficulty-${eq.movementBaseDifficulty}`) }]
            : []),
        ]}
      />
    </Panel>
  );
}

/** A group of the equipment stats: its title and the label / value rows (penalties red when negative). */
function StatGroup({ title, rows }: { title: string; rows: KeyValueRow[] }) {
  return (
    <Box sx={{ mt: 2 }}>
      <SectionLabel>{title}</SectionLabel>
      <KeyValueList dense rows={rows} />
    </Box>
  );
}

/** Weights and percents with at most two decimals. */
export const formatWeight = (value: number): string => `${Math.round(value * 100) / 100}`;
