/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListSubheader,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  addCharacterTrait,
  BonusDevPointsSummary,
  Character,
  fetchTraits,
  KeyValueList,
  KeyValueRow,
  LoadingState,
  StrategicGame,
  Trait,
  traitCategories,
  TraitTypeChip,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolvePowerLevel } from '../../../services/game-rules';
import { useStrategicNotify } from '../../../services/notify-service';
import { toRoman } from '../../../services/roman-number-service';
import TalentPolicyChip from '../../../shared/chips/TalentPolicyChip';
import SelectTraitSpecialization from './SelectTraitSpecialization';
import {
  evaluateTraitPurchase,
  evaluateTraitRow,
  findOwnedTrait,
  initialTier,
  ownedTraits,
  talentPolicyOf,
  TraitBlockReason,
  TraitPurchase,
} from './trait-rules';

type TypeFilter = 'all' | 'talent' | 'flaw';

const ALL = 'all';

/** Reasons that only depend on the points or the cost limits ("only affordable" hides them). */
const COST_REASONS = [
  'trait-reason-max-cost',
  'trait-reason-not-affordable',
  'err-talent-policy-bonus-points-only',
  'err-talent-policy-flaw-points-only',
  'err-talent-policy-creation-only',
];

/** Order of the categories: the catalog ones first, any other one after them. */
const categoryOrder = (category: string) => {
  const index = traitCategories.indexOf(category);
  return index < 0 ? traitCategories.length : index;
};

const useTraitName = () => {
  const { t } = useTranslation();
  return (trait: Trait) => t(trait.id, { defaultValue: trait.name });
};

const useReasonText = () => {
  const { t } = useTranslation();
  return (reason: TraitBlockReason) => {
    const params = { ...reason.params };
    if (typeof params.tier === 'number') params.tier = toRoman(params.tier);
    return t(reason.key, params);
  };
};

/**
 * Trait selector: a searchable list grouped by category with the cost and the reason a trait cannot be bought, and a
 * detail panel with the tier, the specialization, the total cost and the points that pay it. Full screen below `md`,
 * where the list and the detail are two steps. Everything is reset on close.
 */
const AddTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, strategicGame, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const traitName = useTraitName();

  const [traits, setTraits] = useState<Trait[]>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [onlyAffordable, setOnlyAffordable] = useState(false);
  const [selected, setSelected] = useState<Trait>();
  const [tier, setTier] = useState<number>();
  const [specialization, setSpecialization] = useState<string>();
  const [showDetail, setShowDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Every trait at once, kept while the dialog is open.
  useEffect(() => {
    if (!open || traits) return;
    fetchTraits('', 0, 500, auth)
      .then((page) => setTraits(page.content))
      .catch((error) => notify.error(error));
  }, [open]);

  const reset = () => {
    setTraits(undefined);
    setSearch('');
    setTypeFilter(ALL);
    setCategory(ALL);
    setOnlyAffordable(false);
    setSelected(undefined);
    setTier(undefined);
    setSpecialization(undefined);
    setShowDetail(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const rows = useMemo(
    () => (traits ?? []).map((trait) => ({ trait, check: evaluateTraitRow(character, strategicGame, trait) })),
    [traits, character, strategicGame]
  );

  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.trait.category))].sort((a, b) => categoryOrder(a) - categoryOrder(b)),
    [rows]
  );

  const groups = useMemo(() => {
    const text = search.trim().toLowerCase();
    const visible = rows.filter(({ trait, check }) => {
      if (typeFilter === 'talent' && !trait.isTalent) return false;
      if (typeFilter === 'flaw' && trait.isTalent) return false;
      if (category !== ALL && trait.category !== category) return false;
      if (onlyAffordable && check.blocked && COST_REASONS.includes(check.blocked.key)) return false;
      return !text || traitName(trait).toLowerCase().includes(text);
    });
    const byCategory = new Map<string, typeof visible>();
    visible
      .sort((a, b) => traitName(a.trait).localeCompare(traitName(b.trait)))
      .forEach((row) => byCategory.set(row.trait.category, [...(byCategory.get(row.trait.category) ?? []), row]));
    return [...byCategory.entries()].sort(([a], [b]) => categoryOrder(a) - categoryOrder(b));
  }, [rows, search, typeFilter, category, onlyAffordable, t]);

  const selectTrait = (trait: Trait) => {
    setSelected(trait);
    setSpecialization(undefined);
    setTier(initialTier(character, trait));
    setShowDetail(true);
  };

  const changeSpecialization = (value: string) => {
    setSpecialization(value || undefined);
    if (selected) setTier(initialTier(character, selected, value || undefined));
  };

  const purchase =
    selected && evaluateTraitPurchase(character, strategicGame, selected, tier, specialization || undefined);
  const valid =
    !!selected &&
    !!purchase &&
    !purchase.blocked &&
    (!selected.isTierBased || (!!tier && tier >= 1 && tier <= (selected.maxTier ?? tier))) &&
    (!selected.specialization || !!specialization);

  const onSubmit = () => {
    if (!selected || !valid) return;
    setSubmitting(true);
    addCharacterTrait(
      character.id,
      { traitId: selected.id, tier: selected.isTierBased ? tier : undefined, specialization },
      auth
    )
      .then((updated) => {
        setCharacter(updated);
        handleClose();
      })
      .catch((error) => {
        setSubmitting(false);
        notify.error(error);
      });
  };

  const powerLevel = resolvePowerLevel(strategicGame?.powerLevel);
  const listVisible = !compact || !showDetail;
  const detailVisible = !compact || showDetail;

  const list = (
    <Stack spacing={1.5} sx={{ minHeight: 0, height: '100%' }}>
      <TextField
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('search')}
        aria-label={t('search')}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={typeFilter}
          onChange={(_, value: TypeFilter | null) => value && setTypeFilter(value)}
          aria-label={t('trait-type')}
        >
          <ToggleButton value={ALL}>{t('all')}</ToggleButton>
          <ToggleButton value="talent">{t('talents')}</ToggleButton>
          <ToggleButton value="flaw">{t('flaws')}</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Switch size="small" checked={onlyAffordable} onChange={(_, v) => setOnlyAffordable(v)} />}
          label={t('only-affordable')}
        />
      </Stack>
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }} aria-label={t('category')}>
        {[ALL, ...categories].map((option) => (
          <Chip
            key={option}
            size="small"
            label={t(option)}
            color={category === option ? 'primary' : 'default'}
            variant={category === option ? 'filled' : 'outlined'}
            onClick={() => setCategory(option)}
          />
        ))}
      </Stack>
      <Box
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}
        role="region"
        aria-label={t('traits')}
      >
        {!traits ? (
          <LoadingState />
        ) : groups.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            {t('no-results')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {groups.map(([group, items]) => (
              <li key={group}>
                <Box component="ul" sx={{ p: 0 }}>
                  <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}>
                    {t(group)} · {items.length}
                  </ListSubheader>
                  {items.map(({ trait, check }) => (
                    <TraitRow
                      key={trait.id}
                      trait={trait}
                      check={check}
                      character={character}
                      selected={selected?.id === trait.id}
                      onSelect={() => selectTrait(trait)}
                    />
                  ))}
                </Box>
              </li>
            ))}
          </List>
        )}
      </Box>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={compact}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: compact ? undefined : { height: '85vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        {compact && showDetail && (
          <IconButton onClick={() => setShowDetail(false)} aria-label={t('back')} edge="start">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
          {t('add-trait')}
        </Box>
        <IconButton onClick={handleClose} aria-label={t('close')}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
        <Stack
          direction="row"
          sx={{ flexWrap: 'wrap', alignItems: 'center', columnGap: 3, rowGap: 1 }}
          aria-label={t('trait-resources')}
        >
          <Typography variant="body2" color="text.secondary">
            {t('dp-available')}: <b>{character.experience.availableDevPoints ?? 0}</b>
          </Typography>
          <BonusDevPointsSummary
            character={character}
            strategicGame={strategicGame}
            limit={powerLevel.raceDevPointsPerLevel}
          />
          <Typography variant="body2" color="text.secondary">
            {t('max-trait-cost')}: <b>{powerLevel.maxTraitCost}</b>
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('talent-policy')}:
            </Typography>
            <TalentPolicyChip policy={talentPolicyOf(strategicGame)} />
          </Stack>
        </Stack>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
          }}
        >
          {listVisible && <Box sx={{ minHeight: { xs: 320, md: 0 }, display: 'flex' }}>{list}</Box>}
          {detailVisible && (
            <Box sx={{ minHeight: 0, overflowY: 'auto' }}>
              {selected && purchase ? (
                <TraitDetail
                  character={character}
                  trait={selected}
                  tier={tier}
                  setTier={setTier}
                  specialization={specialization}
                  setSpecialization={changeSpecialization}
                  purchase={purchase}
                />
              ) : (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  {t('trait-select-hint')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={onSubmit} variant="contained" disabled={!valid || submitting}>
          {purchase?.isImprovement ? t('trait-improve') : t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** One trait of the list: name, type, cost and owned marker; disabled with the reason when it cannot be bought. */
const TraitRow: FC<{
  trait: Trait;
  check: TraitPurchase;
  character: Character;
  selected: boolean;
  onSelect: () => void;
}> = ({ trait, check, character, selected, onSelect }) => {
  const { t } = useTranslation();
  const traitName = useTraitName();
  const reasonText = useReasonText();
  const owned = ownedTraits(character, trait.id);
  const ownedTier = owned.find((item) => item.tier)?.tier;
  const row = (
    <ListItemButton
      selected={selected}
      disabled={!!check.blocked}
      onClick={onSelect}
      sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {traitName(trait)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('trait-cost-value', { cost: trait.adquisitionCost })}
          {trait.isTierBased && ` · ${t('trait-cost-per-tier', { cost: trait.tierCost ?? 0 })}`}
        </Typography>
      </Box>
      {owned.length > 0 && (
        <Chip
          size="small"
          color="info"
          variant="outlined"
          label={ownedTier ? t('trait-owned-tier', { tier: toRoman(ownedTier) }) : t('trait-owned')}
        />
      )}
      <TraitTypeChip isTalent={trait.isTalent} />
    </ListItemButton>
  );
  if (!check.blocked) return row;
  // Disabled buttons do not fire pointer events: the tooltip goes on a wrapper.
  return (
    <Tooltip title={reasonText(check.blocked)} placement="top-start">
      <Box>{row}</Box>
    </Tooltip>
  );
};

/** Detail of the selected trait: description, tier, specialization, total cost and the points that pay it. */
const TraitDetail: FC<{
  character: Character;
  trait: Trait;
  tier?: number;
  setTier: (tier: number) => void;
  specialization?: string;
  setSpecialization: (value: string) => void;
  purchase: TraitPurchase;
}> = ({ character, trait, tier, setTier, specialization, setSpecialization, purchase }) => {
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
  if (purchase.isImprovement && current) {
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
        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
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
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
        {trait.description || t('no-description')}
      </Typography>
      {trait.specialization && (
        <SelectTraitSpecialization value={specialization ?? ''} trait={trait} onChange={setSpecialization} />
      )}
      {trait.isTierBased && (
        <Box>
          <Typography variant="overline" color="text.secondary" component="div">
            {t('tier')}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={tier ?? null}
            onChange={(_, value: number | null) => value && setTier(value)}
            aria-label={t('tier')}
            sx={{ flexWrap: 'wrap' }}
          >
            {Array.from({ length: trait.maxTier ?? 1 }, (_, index) => index + 1).map((option) => (
              <ToggleButton key={option} value={option} disabled={option <= currentTier} sx={{ minWidth: 44 }}>
                {toRoman(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
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
      <Divider />
      <KeyValueList rows={costRows} />
      {purchase.blocked && <Alert severity="warning">{reasonText(purchase.blocked)}</Alert>}
      {!purchase.blocked && trait.specialization && !specialization && (
        <Alert severity="info">{t('trait-specialization-needed')}</Alert>
      )}
    </Stack>
  );
};

export default AddTraitDialog;
