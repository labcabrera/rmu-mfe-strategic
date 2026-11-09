import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  FormControlLabel,
  List,
  ListItemButton,
  ListSubheader,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Character,
  ChipRow,
  EmptyState,
  LoadingState,
  SearchField,
  Trait,
  TraitTypeChip,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import { ownedTraits, TRAIT_FILTER_ALL as ALL, TraitPurchase, TraitTypeFilter } from './trait-rules';
import { AddTraitFormState } from './use-add-trait-form';
import { useReasonText, useTraitName } from './use-trait-text';

/** Searchable list of the traits grouped by category, with the type, category and affordability filters. */
const TraitListPanel: FC<{ character: Character; state: AddTraitFormState }> = ({ character, state }) => {
  const { t } = useTranslation();
  const { form, update, traits, categories, groups, selectTrait } = state;
  const { search, typeFilter, category, onlyAffordable, selected } = form;

  return (
    <Stack spacing={1.5} sx={{ minHeight: 0, height: '100%' }}>
      <SearchField size="small" value={search} onChange={(value) => update({ search: value })} delay={0} />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={typeFilter}
          onChange={(_, value: TraitTypeFilter | null) => value && update({ typeFilter: value })}
          aria-label={t('trait-type')}
        >
          <ToggleButton value={ALL}>{t('all')}</ToggleButton>
          <ToggleButton value="talent">{t('talents')}</ToggleButton>
          <ToggleButton value="flaw">{t('flaws')}</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Switch size="small" checked={onlyAffordable} onChange={(_, v) => update({ onlyAffordable: v })} />}
          label={t('only-affordable')}
        />
      </Stack>
      <ChipRow>
        {[ALL, ...categories].map((option) => (
          <Chip
            key={option}
            size="small"
            label={t(option)}
            color={category === option ? 'primary' : 'default'}
            variant={category === option ? 'filled' : 'outlined'}
            onClick={() => update({ category: option })}
          />
        ))}
      </ChipRow>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
          borderRadius: (theme) => `${theme.radius.sm}px`,
        }}
        role="region"
        aria-label={t('traits')}
      >
        {!traits ? (
          <LoadingState />
        ) : groups.length === 0 ? (
          <Box sx={{ px: 2 }}>
            <EmptyState dense />
          </Box>
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

export default TraitListPanel;
