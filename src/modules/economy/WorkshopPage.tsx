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
  CraftingPlan,
  CraftingQualityDto,
  craftKind,
  fetchMaterials,
  isBluntWeapon,
  Material,
  quoteCraft,
  EconomyRules,
  fetchEconomyRules,
  Item,
  ItemCatalogBrowser,
  itemCatalogFilters,
  ItemInventory,
  ItemOperationResult,
  ItemThumb,
  MoneyDisplay,
  NotFound,
  NumericInput,
  roundGold,
  STRATEGIC_ITEM_MODIFIER_TARGETS,
  StrategicItem,
  useItemCatalog,
  useListFilters,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CraftQualityStep from './CraftQualityStep';
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
import { GOLD_COIN, HolderView, useHolder } from './use-holder';

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
            onChange={(_, value: WorkshopTab) =>
              // Merge into the query, which also holds the filters of the catalog (spec 056, B-04)
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  next.set('tab', value);
                  return next;
                },
                { replace: true }
              )
            }
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
const STEPS = [
  'craft-step-type',
  'craft-step-craftsman',
  'craft-step-quality',
  'craft-step-enhancements',
  'craft-step-roll',
];

/** Quote the plan once the inputs stop changing. */
const QUOTE_DELAY_MS = 300;

const CraftWizard: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const filters = useListFilters<Item>(itemCatalogFilters(t));
  const catalog = useItemCatalog({ exclude: [GOLD_COIN] });
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
  // Spec 043: quality of the craft and the plan the API quotes for it
  const [quality, setQuality] = useState<CraftingQualityDto>({});
  const [materialList, setMaterialList] = useState<Material[] | null>(null);
  const [materialsError, setMaterialsError] = useState(false);
  const [plan, setPlan] = useState<CraftingPlan>();
  const [planError, setPlanError] = useState<string>();
  const kind = itemType ? craftKind(itemType) : 'other';
  const blunt = itemType ? isBluntWeapon(itemType) : false;

  useEffect(() => {
    fetchEconomyRules(auth).then(setRules).catch(notify.error);
    // Materials are rulebook content: without access the craft goes on without them
    fetchMaterials(auth)
      .then(setMaterialList)
      .catch(() => setMaterialsError(true));
  }, []);

  /** The quality as the API takes it: the blunt switch defaults to the attack table of the weapon. */
  const qualityDto = useMemo((): CraftingQualityDto | undefined => {
    const dto: CraftingQualityDto = { ...quality };
    if (dto.materialId && dto.blunt === undefined && blunt) dto.blunt = true;
    return Object.keys(dto).length > 0 ? dto : undefined;
  }, [quality, blunt]);

  useEffect(() => {
    if (!itemType) return;
    const timer = setTimeout(() => {
      quoteCraft(
        {
          itemTypeId: itemType.id,
          ...(itemType.info.stackable && amount ? { amount } : {}),
          ...(qualityDto ? { quality: qualityDto } : {}),
          ...(materialsCost !== null ? { materialsCost } : {}),
          ...(enhancementsCost ? { enhancementsCost } : {}),
        },
        auth
      )
        .then((quoted) => {
          setPlan(quoted);
          setPlanError(undefined);
        })
        .catch((e: { code?: string; errorCode?: string; message?: string }) =>
          setPlanError(e.code ?? e.errorCode ?? e.message ?? 'error')
        );
    }, QUOTE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [itemType, amount, qualityDto, materialsCost, enhancementsCost]);

  const materials = useMemo(
    () =>
      materialsCost ??
      roundGold(((itemType?.info.cost?.average ?? 0) * (amount ?? 1) * (rules?.materialsPercent ?? 50)) / 100),
    [itemType, amount, rules, materialsCost]
  );
  const cost = plan && !planError ? plan.cost.total : roundGold(materials + (enhancementsCost ?? 0));

  const reset = () => {
    setResult(undefined);
    setStep(0);
    setItemType(undefined);
    setEnhancements([]);
    setName('');
    setMaterialsCost(null);
    setEnhancementsCost(null);
    setQuality({});
    setPlan(undefined);
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
        ...(qualityDto ? { quality: qualityDto } : {}),
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

  const qualityReady = !planError && (quality.masterwork !== 'circumstantial' || !!quality.circumstance?.trim());
  const canNext = [
    !!itemType,
    !!actorId,
    qualityReady,
    true,
    isManeuverReady(actor, maneuver) && !busy && qualityReady,
  ][step];
  const automatic = (plan?.modifiers ?? []).reduce((sum, modifier) => sum + modifier.value, 0);

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
              {(plan?.productionHours ?? itemType.info.productionHours) !== null && (
                <Typography variant="caption" color="text.secondary">
                  {t('production-hours-value', { hours: plan?.productionHours ?? itemType.info.productionHours })}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}

      {step === 0 && (
        <ItemCatalogBrowser
          items={catalog.items}
          filters={filters}
          layout="drawer"
          truncated={catalog.truncated}
          error={catalog.error}
          refresh={catalog.refresh}
          storageKey="strategic.workshop"
          selectedId={itemType?.id}
          onSelect={(item) => {
            setItemType(item);
            setQuality({});
            setPlan(undefined);
            setStep(1);
          }}
          price={(item) => (
            <Stack component="span">
              <MoneyDisplay
                gold={roundGold(((item.info.cost?.average ?? 0) * (rules?.materialsPercent ?? 50)) / 100)}
                variant="subtitle2"
              />
              {item.info.productionHours !== null && (
                <Typography component="span" variant="caption" color="text.secondary">
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

      {step === 2 && itemType && (
        <CraftQualityStep
          kind={kind}
          blunt={blunt}
          materials={materialList}
          materialsError={materialsError}
          value={quality}
          onChange={setQuality}
          plan={plan}
          planError={planError}
          free={payer === 'free'}
        />
      )}

      {step === 3 && (
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
                  placeholder={`${plan && !planError && !plan.cost.asked ? plan.cost.materials : materials}`}
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

      {step === 4 && (
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
              extra={{ label: t('craft-quality-modifiers'), value: automatic }}
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
