/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useParams, useSearchParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CharacterPicker,
  characterOption,
  craftItem,
  CraftingEnhancement,
  EconomyRules,
  fetchEconomyRules,
  Item,
  ItemInventory,
  ItemOperationResult,
  ItemThumb,
  MoneyDisplay,
  NotFound,
  NumericInput,
  roundGold,
  STRATEGIC_ITEM_MODIFIER_TARGETS,
  StrategicItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CatalogBrowser, { useCatalog } from './CatalogBrowser';
import EconomyLayout from './EconomyLayout';
import { isRepairable } from './HolderInventory';
import ItemLedgerOutcome from './ItemLedgerOutcome';
import { CRAFT_SKILLS, RepairItemDialog } from './ItemOperationDialogs';
import ManeuverFields, {
  defaultSkillKey,
  emptyManeuver,
  isManeuverReady,
  ManeuverValue,
  toManeuverDto,
} from './ManeuverFields';
import { HolderView, useHolder } from './use-holder';

type WorkshopTab = 'craft' | 'repair';
const TABS: WorkshopTab[] = ['craft', 'repair'];

/** The workshop of a character or a faction (spec 023, decisions 10 and 11): craft an item, or repair one. */
export default function WorkshopPage() {
  const { t } = useTranslation();
  const { holderKind, holderId } = useParams<{ holderKind: string; holderId: string }>();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((value) => value === params.get('tab')) ?? 'craft') as WorkshopTab;
  const { view, refresh, invalid, error } = useHolder(holderKind, holderId);

  if (invalid) return <NotFound />;

  return (
    <EconomyLayout page="workshop" view={view} error={error} onRetry={refresh}>
      {view && (
        <>
          <Tabs
            value={tab}
            onChange={(_, value: WorkshopTab) => setParams({ tab: value }, { replace: true })}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {TABS.map((value) => (
              <Tab key={value} value={value} label={t(`workshop-tab-${value}`)} />
            ))}
          </Tabs>
          {tab === 'craft' && <CraftWizard view={view} onDone={refresh} />}
          {tab === 'repair' && <RepairList view={view} onDone={refresh} />}
        </>
      )}
    </EconomyLayout>
  );
}

type PayerOption = 'recipient' | 'faction' | 'free';
const STEPS = ['craft-step-type', 'craft-step-craftsman', 'craft-step-enhancements', 'craft-step-roll'];

const CraftWizard: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const catalog = useCatalog();
  const [rules, setRules] = useState<EconomyRules>();
  const [step, setStep] = useState(0);
  const [itemType, setItemType] = useState<Item>();
  const craftsmen = view.members;
  const [actorId, setActorId] = useState(view.character?.id ?? craftsmen[0]?.id ?? '');
  const actor = craftsmen.find((member) => member.id === actorId) ?? view.character;
  const [maneuver, setManeuver] = useState<ManeuverValue>(emptyManeuver(defaultSkillKey(actor, CRAFT_SKILLS), 'm'));
  const [payer, setPayer] = useState<PayerOption>('recipient');
  const [amount, setAmount] = useState<number | null>(1);
  const [name, setName] = useState('');
  const [materialsCost, setMaterialsCost] = useState<number | null>(null);
  const [enhancementsCost, setEnhancementsCost] = useState<number | null>(null);
  const [enhancements, setEnhancements] = useState<CraftingEnhancement[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ItemOperationResult>();

  useEffect(() => {
    fetchEconomyRules(auth).then(setRules).catch(notify.error);
  }, []);

  const materials = useMemo(
    () =>
      materialsCost ??
      roundGold(((itemType?.info.cost?.average ?? 0) * (amount ?? 1) * (rules?.materialsPercent ?? 50)) / 100),
    [itemType, amount, rules, materialsCost]
  );
  const cost = roundGold(materials + (enhancementsCost ?? 0));

  const reset = () => {
    setResult(undefined);
    setStep(0);
    setItemType(undefined);
    setEnhancements([]);
    setName('');
    setMaterialsCost(null);
    setEnhancementsCost(null);
    setManeuver({ ...maneuver, roll: null, unmodifiedRoll: undefined });
  };

  const onCraft = () => {
    if (!itemType || !actorId) return;
    setBusy(true);
    craftItem(
      {
        itemTypeId: itemType.id,
        maneuver: { ...toManeuverDto(maneuver), actorId },
        to: view.holder,
        ...(payer === 'free' ? { free: true } : {}),
        ...(payer === 'faction' && view.faction ? { payer: { kind: 'faction', id: view.faction.id } } : {}),
        ...(itemType.info.stackable && amount ? { amount } : {}),
        ...(materialsCost !== null ? { materialsCost } : {}),
        ...(enhancements.length > 0 ? { enhancements: enhancements.filter((e) => e.value !== 0) } : {}),
        ...(enhancementsCost ? { enhancementsCost } : {}),
        ...(name.trim() ? { name: name.trim() } : {}),
      },
      auth
    )
      .then((data) => {
        setResult(data);
        onDone();
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  if (result) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <ItemLedgerOutcome entry={result.entry} item={result.item} />
        <Button sx={{ mt: 2 }} variant="contained" onClick={reset}>
          {t('craft-another')}
        </Button>
      </Paper>
    );
  }

  const canNext = [!!itemType, !!actorId, true, isManeuverReady(actor, maneuver) && !busy][step];

  return (
    <Stack spacing={2}>
      <Stepper activeStep={step} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{t(label)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {itemType && step > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ItemThumb item={itemType} size={48} />
          <Stack>
            <Typography sx={{ fontWeight: 600 }}>{name.trim() || t(itemType.name, itemType.name)}</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('craft-cost')}
              </Typography>
              <MoneyDisplay gold={payer === 'free' ? 0 : cost} variant="caption" />
              {itemType.info.productionHours !== null && (
                <Typography variant="caption" color="text.secondary">
                  {t('production-hours-value', { hours: itemType.info.productionHours })}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}

      {step === 0 && (
        <CatalogBrowser
          catalog={catalog}
          selectedId={itemType?.id}
          onSelect={(item) => {
            setItemType(item);
            setStep(1);
          }}
          extra={(item) => (
            <Stack sx={{ alignItems: 'center' }}>
              <MoneyDisplay
                gold={roundGold(((item.info.cost?.average ?? 0) * (rules?.materialsPercent ?? 50)) / 100)}
              />
              {item.info.productionHours !== null && (
                <Typography variant="caption" color="text.secondary">
                  {t('production-hours-value', { hours: item.info.productionHours })}
                </Typography>
              )}
            </Stack>
          )}
        />
      )}

      {step === 1 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CharacterPicker
                label={t('craftsman')}
                options={craftsmen.map((member) => characterOption(member))}
                relation="friends"
                factionId={view.faction?.id}
                value={actorId}
                onChange={(id) => {
                  if (!id) return;
                  setActorId(id);
                  const next = craftsmen.find((member) => member.id === id);
                  setManeuver({ ...maneuver, skillKey: defaultSkillKey(next, CRAFT_SKILLS) });
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label={t('payer')}
                value={payer}
                onChange={(e) => setPayer(e.target.value as PayerOption)}
              >
                <MenuItem value="recipient">{view.name}</MenuItem>
                {view.holder.kind === 'character' && view.faction && (
                  <MenuItem value="faction">{t('armory-of', { name: view.faction.name })}</MenuItem>
                )}
                <MenuItem value="free">{t('craft-free')}</MenuItem>
              </TextField>
            </Grid>
            {!craftsmen.length && (
              <Grid size={12}>
                <Alert severity="warning">{t('craft-no-craftsman')}</Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {step === 2 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('name')}
                  placeholder={itemType ? t(itemType.name, itemType.name) : undefined}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              {itemType?.info.stackable && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <NumericInput label={t('amount')} value={amount} onChange={setAmount} min={1} integer />
                </Grid>
              )}
              <Grid size={{ xs: 6, sm: 3 }}>
                <NumericInput
                  label={t('craft-materials-cost')}
                  placeholder={`${materials}`}
                  value={materialsCost}
                  onChange={setMaterialsCost}
                  min={0}
                  maxFractionDigits={3}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <NumericInput
                  label={t('craft-enhancements-cost')}
                  value={enhancementsCost}
                  onChange={setEnhancementsCost}
                  min={0}
                  maxFractionDigits={3}
                />
              </Grid>
            </Grid>
            <Typography variant="overline" color="text.secondary">
              {t('craft-enhancements')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('craft-enhancements-hint')}
            </Typography>
            {enhancements.map((enhancement, index) => (
              <Stack
                key={index}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <TextField
                  select
                  size="small"
                  label={t('item-modifier-applies-to')}
                  value={enhancement.appliesTo}
                  onChange={(e) =>
                    setEnhancements(
                      enhancements.map((other, i) => (i === index ? { ...other, appliesTo: e.target.value } : other))
                    )
                  }
                  sx={{ minWidth: 160 }}
                >
                  {STRATEGIC_ITEM_MODIFIER_TARGETS.map((target) => (
                    <MenuItem key={target} value={target}>
                      {t(`item-modifier-target-${target}`)}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ width: 100 }}>
                  <NumericInput
                    label={t('value')}
                    value={enhancement.value}
                    onChange={(value) =>
                      setEnhancements(
                        enhancements.map((other, i) => (i === index ? { ...other, value: value ?? 0 } : other))
                      )
                    }
                    integer
                    allowNegatives
                  />
                </Box>
                <TextField
                  size="small"
                  label={t('description')}
                  value={enhancement.description ?? ''}
                  onChange={(e) =>
                    setEnhancements(
                      enhancements.map((other, i) => (i === index ? { ...other, description: e.target.value } : other))
                    )
                  }
                  sx={{ flex: 1 }}
                />
                <IconButton
                  aria-label={t('remove')}
                  onClick={() => setEnhancements(enhancements.filter((_, i) => i !== index))}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => setEnhancements([...enhancements, { appliesTo: 'attack', value: 5 }])}
            >
              {t('craft-add-enhancement')}
            </Button>
          </Stack>
        </Paper>
      )}

      {step === 3 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('craft-roll-hint')}
            </Typography>
            <ManeuverFields
              character={actor}
              value={maneuver}
              onChange={setManeuver}
              preferred={CRAFT_SKILLS}
              showDifficulty
            />
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
          {t('back')}
        </Button>
        {step < STEPS.length - 1 ? (
          step > 0 && (
            <Button variant="contained" disabled={!canNext} onClick={() => setStep(step + 1)}>
              {t('next')}
            </Button>
          )
        ) : (
          <Button variant="contained" disabled={!canNext} onClick={onCraft}>
            {t('craft')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

const RepairList: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const { t } = useTranslation();
  const [item, setItem] = useState<StrategicItem>();
  const damaged = view.items.filter(isRepairable);
  return (
    <>
      <ItemInventory
        items={damaged}
        emptyTitle={t('repair-nothing')}
        onSelect={setItem}
        actions={() => [{ key: 'repair', label: t('repair'), onClick: setItem }]}
      />
      {item && (
        <RepairItemDialog
          item={item}
          view={view}
          onClose={() => setItem(undefined)}
          onDone={() => {
            setItem(undefined);
            onDone();
          }}
        />
      )}
    </>
  );
};
