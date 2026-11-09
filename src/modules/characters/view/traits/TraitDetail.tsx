import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Chip, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import {
  Character,
  ChipRow,
  DEV_POINTS_POOLS,
  DevPointsPool,
  KeyValueList,
  KeyValueRow,
  SectionLabel,
  Trait,
  TraitTypeChip,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import TraitSpecializationPicker from './TraitSpecializationPicker';
import { findOwnedTrait, TraitPurchase } from './trait-rules';
import { useReasonText, useTraitName } from './use-trait-text';

/** Detail of the selected trait: description, tier, specialization, total cost and the points that pay it. */
const TraitDetail: FC<{
  character: Character;
  trait: Trait;
  tier?: number;
  setTier: (tier: number) => void;
  specialization?: string;
  setSpecialization: (value: string) => void;
  purchase: TraitPurchase;
  pool: DevPointsPool;
  setPool: (pool: DevPointsPool) => void;
  /** Choices of a particular trait (the languages of Multilingual). */
  extra?: ReactNode;
}> = ({ character, trait, tier, setTier, specialization, setSpecialization, purchase, pool, setPool, extra }) => {
  const { t } = useTranslation();
  const traitName = useTraitName();
  const reasonText = useReasonText();
  const current = findOwnedTrait(character, trait.id, specialization);
  const currentTier = current?.tier ?? 0;

  const costRows: KeyValueRow[] = [
    {
      label: t('trait-total-cost'),
      value: purchase.cost,
      hint: trait.isTierBased
        ? t('trait-tier-cost', { cost: trait.adquisitionCost, tierCost: trait.tierCost ?? 0 })
        : undefined,
    },
  ];
  if ((purchase.isImprovement || purchase.isLowering) && current) {
    costRows.push({ label: t('trait-already-paid'), value: current.cost });
    costRows.push({ label: t('trait-charged'), value: purchase.charged });
  }
  if (purchase.charged < 0) {
    const pool = purchase.pools[0] ?? 'normal';
    costRows.push({ label: t(`trait-returns-${pool}`), value: `+${-purchase.charged}` });
  } else {
    (['normal', 'bonus', 'flaw'] as const)
      .filter((pool) => purchase.payment[pool] > 0)
      .forEach((pool) => costRows.push({ label: t(`trait-pool-${pool}`), value: purchase.payment[pool] }));
  }

  return (
    <Stack spacing={2} sx={{ p: { xs: 0, md: 1 } }}>
      <Box>
        <Typography variant="h6" component="h3" sx={{ fontFamily: (theme) => theme.fonts?.display }}>
          {traitName(trait)}
        </Typography>
        <ChipRow sx={{ mt: 0.5 }}>
          <TraitTypeChip isTalent={trait.isTalent} />
          <Chip size="small" variant="outlined" label={t(trait.category)} />
          {current && (
            <Chip
              size="small"
              color="info"
              variant="outlined"
              label={current.tier ? t('trait-owned-tier', { tier: toRoman(current.tier) }) : t('trait-owned')}
            />
          )}
        </ChipRow>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
        {trait.description || t('no-description')}
      </Typography>
      {trait.specialization && (
        <TraitSpecializationPicker value={specialization ?? ''} trait={trait} onChange={setSpecialization} />
      )}
      {trait.isTierBased && (
        <Box>
          <SectionLabel>{t('tier')}</SectionLabel>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={tier ?? null}
            onChange={(_, value: number | null) => value && setTier(value)}
            aria-label={t('tier')}
            sx={{ flexWrap: 'wrap' }}
          >
            {Array.from({ length: trait.maxTier ?? 1 }, (_, index) => index + 1).map((option) => (
              <ToggleButton
                key={option}
                value={option}
                // Spec 077, C10: an owned flaw can be lowered; a talent only goes up
                disabled={trait.isTalent ? option <= currentTier : option === currentTier}
                sx={{ minWidth: 44 }}
              >
                {toRoman(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {purchase.isLowering && current?.tier && tier && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('trait-lower-summary', {
                from: toRoman(current.tier),
                to: toRoman(tier),
                cost: purchase.charged,
              })}
            </Typography>
          )}
          {purchase.isImprovement && current?.tier && tier && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('trait-improve-summary', {
                from: toRoman(current.tier),
                to: toRoman(tier),
                cost: purchase.charged,
              })}
            </Typography>
          )}
        </Box>
      )}
      {extra}
      <Divider />
      {/* Spec 076, A3: the pool that pays it, when the talent policy fixes none */}
      {purchase.poolChoosable && purchase.charged > 0 && (
        <Box>
          <SectionLabel>{t('dev-points-pool')}</SectionLabel>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={pool}
            onChange={(_, value: DevPointsPool | null) => value && setPool(value)}
            aria-label={t('dev-points-pool')}
            sx={{ flexWrap: 'wrap' }}
          >
            {DEV_POINTS_POOLS.map((option) => (
              <ToggleButton key={option} value={option}>
                {t(`dev-points-pool-${option}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}
      <KeyValueList rows={costRows} />
      {purchase.blocked && <Alert severity="warning">{reasonText(purchase.blocked)}</Alert>}
      {!purchase.blocked && trait.specialization && !specialization && (
        <Alert severity="info">{t('trait-specialization-needed')}</Alert>
      )}
    </Stack>
  );
};

export default TraitDetail;
