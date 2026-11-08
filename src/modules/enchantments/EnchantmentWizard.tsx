/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  alchemyEffectText,
  Character,
  characterOption,
  CharacterPicker,
  createEnchantment,
  DEFAULT_POWER_LEVEL,
  EmptyState,
  ENCHANTMENT_SCOPES,
  EnchantmentPlan,
  EnchantmentProject,
  EnchantmentRequest,
  EnchantmentScope,
  fetchCharacterSpells,
  fetchStrategicGame,
  FlowSteps,
  isEnchantmentActive,
  ItemHolder,
  ItemInventory,
  ItemThumb,
  KnownSpell,
  KnownSpellList,
  LoadingState,
  MoneyDisplay,
  OPEN_D100,
  Panel,
  POWER_LEVELS,
  PowerLevel,
  quoteEnchantment,
  RollField,
  SearchField,
  StrategicItem,
  useModifierLabel,
  useNotify,
  useSpellName,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { GOLD_COIN, HolderView } from '../economy/use-holder';
import EnchantmentPlanView from './EnchantmentPlanView';
import { errorCode } from './enchantment-format';

const STEPS = [
  'enchantment-step-alchemist',
  'enchantment-step-item',
  'enchantment-step-spells',
  'enchantment-step-quote',
  'enchantment-step-scr',
];

/** Quote the plan once the inputs stop changing. */
const QUOTE_DELAY_MS = 300;

type PayerOption = 'holder' | 'faction' | 'free';

/** A spell of the grimoire of the alchemist, with its list. */
type GrimoireSpell = { list: KnownSpellList; known: KnownSpell };
type SpellChoice = { scope: EnchantmentScope; target: string | null };

const isAlchemical = (entry: GrimoireSpell) => entry.known.spell.modifiers?.type === 'alchemical';

/** The grimoire as one list: the alchemical spells first, then by list and level (spec 064, decision 9). */
const flatten = (lists: KnownSpellList[]): GrimoireSpell[] =>
  lists
    .flatMap((list) => list.spells.map((known) => ({ list, known })))
    .sort(
      (a, b) =>
        Number(isAlchemical(b)) - Number(isAlchemical(a)) ||
        (a.list.name ?? a.list.code).localeCompare(b.list.name ?? b.list.code) ||
        a.known.spell.level - b.known.spell.level
    );

/** Skills of the alchemist a skill bonus can go to, by id. */
const skillIds = (character: Character | undefined): string[] =>
  Array.from(new Set((character?.skills ?? []).map((skill) => skill.skillId))).sort();

/**
 * The five steps of a new enchantment (spec 064, decision 9): the alchemist and who pays, the item, the spells of
 * the grimoire with their scope and target, the batch and the power level with the quote, and the SCR of each spell.
 * The rules live in the API: every number shown comes from its quote.
 */
const EnchantmentWizard: FC<{
  view: HolderView;
  /** Projects of the game: an item in an active one cannot be enchanted. */
  projects: EnchantmentProject[];
  onStarted: (project: EnchantmentProject) => void;
}> = ({ view, projects, onStarted }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const spellName = useSpellName();
  const notify = useNotify();
  const modifierLabel = useModifierLabel();
  const [step, setStep] = useState(0);
  const alchemists = view.members;
  const [alchemistId, setAlchemistId] = useState(view.character?.id ?? alchemists[0]?.id ?? '');
  const alchemist = alchemists.find((member) => member.id === alchemistId) ?? view.character;
  const [payer, setPayer] = useState<PayerOption>('holder');
  const [item, setItem] = useState<StrategicItem>();
  const [grimoire, setGrimoire] = useState<GrimoireSpell[]>();
  const [search, setSearch] = useState('');
  const [chosen, setChosen] = useState<Record<string, SpellChoice>>({});
  const [powerLevel, setPowerLevel] = useState<PowerLevel>(DEFAULT_POWER_LEVEL);
  const [plan, setPlan] = useState<EnchantmentPlan>();
  const [planError, setPlanError] = useState<string>();
  const [rolls, setRolls] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  // Spec 079: the power level preset of the game, when it has one, instead of Superior
  useEffect(() => {
    if (!view.gameId) return;
    fetchStrategicGame(view.gameId, auth)
      .then((game) => game.powerLevel?.preset && setPowerLevel(game.powerLevel.preset))
      .catch(() => undefined);
  }, [view.gameId]);

  useEffect(() => {
    setGrimoire(undefined);
    setChosen({});
    if (!alchemistId) return;
    fetchCharacterSpells(alchemistId, auth)
      .then((lists) => setGrimoire(flatten(lists)))
      .catch((e) => {
        setGrimoire([]);
        notify.error(e);
      });
  }, [alchemistId]);

  const busyItemIds = useMemo(
    () => new Set(projects.filter((project) => isEnchantmentActive(project.status)).map((project) => project.itemId)),
    [projects]
  );
  // Neither an enchanted item nor one of another active project can be enchanted
  const items = view.items.filter(
    (other) => other.itemTypeId !== GOLD_COIN && !other.enchantment && !busyItemIds.has(other.id)
  );
  const stack = item && item.info?.stackable && (item.amount ?? 1) > 1 ? item.amount : null;
  // The API enchants the whole stack: the batch is always every unit of the item
  const batchSize = stack ?? 1;

  const request = useMemo((): EnchantmentRequest | undefined => {
    const spells = Object.entries(chosen).map(([spellId, choice]) => ({
      spellId,
      ...(choice.scope !== 'normal' ? { scope: choice.scope } : {}),
      ...(choice.target ? { target: choice.target } : {}),
    }));
    if (!item || !alchemistId || spells.length === 0) return undefined;
    return { alchemistId, itemId: item.id, spells, batchSize, powerLevel };
  }, [alchemistId, item, chosen, batchSize, powerLevel]);

  useEffect(() => {
    setPlan(undefined);
    setPlanError(undefined);
    if (!request) return;
    const timer = setTimeout(() => {
      quoteEnchantment(request, auth)
        .then((quoted) => {
          setPlan(quoted);
          setPlanError(undefined);
        })
        .catch((e) => setPlanError(errorCode(e)));
    }, QUOTE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [request]);

  const payerHolder = (): ItemHolder | null | undefined => {
    if (payer === 'free') return null;
    if (payer === 'faction' && view.faction) return { kind: 'faction', id: view.faction.id };
    return view.holder;
  };

  const onStart = () => {
    if (!request || !plan) return;
    setBusy(true);
    const scrRolls = Object.fromEntries(plan.spells.map((spell) => [spell.spellId, rolls[spell.spellId]]));
    createEnchantment({ ...request, scrRolls, payer: payerHolder() }, auth)
      .then(onStarted)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const toggle = (spellId: string) =>
    setChosen((current) => {
      const next = { ...current };
      if (next[spellId]) delete next[spellId];
      else next[spellId] = { scope: 'normal', target: null };
      return next;
    });
  const choose = (spellId: string, choice: Partial<SpellChoice>) =>
    setChosen((current) => ({ ...current, [spellId]: { ...current[spellId], ...choice } }));

  const selected = (grimoire ?? []).filter((entry) => chosen[entry.known.spell.id]);
  const hasAlchemical = selected.some(isAlchemical);
  const targetsReady = selected.every(
    (entry) => entry.known.spell.alchemy?.effect?.kind !== 'skill' || !!chosen[entry.known.spell.id]?.target
  );
  const rollsReady = !!plan && plan.spells.every((spell) => rolls[spell.spellId] !== undefined);
  const canNext = [
    !!alchemistId,
    !!item,
    selected.length > 0 && hasAlchemical && targetsReady,
    !!plan && !planError,
    rollsReady && !busy,
  ][step];

  const filter = search.trim().toLowerCase();
  const shown = (grimoire ?? []).filter(
    (entry) =>
      !filter ||
      spellName(entry.known.spell.name).toLowerCase().includes(filter) ||
      (entry.list.name ?? entry.list.code).toLowerCase().includes(filter)
  );

  const stepContent = [
    <Panel variant="outlined">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CharacterPicker
            label={t('enchantment-alchemist')}
            options={alchemists.map((member) => characterOption(member))}
            relation="friends"
            factionId={view.faction?.id}
            value={alchemistId}
            onChange={(id) => id && setAlchemistId(id)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label={t('payer')}
            value={payer}
            onChange={(e) => setPayer(e.target.value as PayerOption)}
            helperText={t('enchantment-payer-hint')}
          >
            <MenuItem value="holder">{view.name}</MenuItem>
            {view.holder.kind === 'character' && view.faction && (
              <MenuItem value="faction">{t('armory-of', { name: view.faction.name })}</MenuItem>
            )}
            <MenuItem value="free">{t('craft-free')}</MenuItem>
          </TextField>
        </Grid>
        {!alchemists.length && (
          <Grid size={12}>
            <Alert severity="warning">{t('enchantment-no-alchemist')}</Alert>
          </Grid>
        )}
      </Grid>
    </Panel>,
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {t('enchantment-item-hint')}
      </Typography>
      <ItemInventory
        items={items}
        hideItemTypeIds={[GOLD_COIN]}
        emptyTitle={t('enchantment-no-items')}
        onSelect={(next) => {
          setItem(next);
          setStep(2);
        }}
      />
    </Stack>,
    <Panel variant="outlined">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('enchantment-spells-hint')}
        </Typography>
        <Box sx={{ maxWidth: 320 }}>
          <SearchField size="small" value={search} onChange={setSearch} delay={0} />
        </Box>
        {!grimoire ? (
          <LoadingState />
        ) : grimoire.length === 0 ? (
          <EmptyState dense title={t('enchantment-no-spells')} />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>{t('spell')}</TableCell>
                  <TableCell>{t('spell-list')}</TableCell>
                  <TableCell>{t('alchemy-effect')}</TableCell>
                  <TableCell>{t('enchantment-scope')}</TableCell>
                  <TableCell>{t('enchantment-target')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shown.map((entry) => {
                  const spell = entry.known.spell;
                  const choice = chosen[spell.id];
                  const effect = spell.alchemy?.effect;
                  return (
                    <TableRow key={spell.id} hover selected={!!choice}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!!choice}
                          onChange={() => toggle(spell.id)}
                          slotProps={{ input: { 'aria-label': spellName(spell.name) } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2">{`${spellName(spell.name)} (${spell.level})`}</Typography>
                          {isAlchemical(entry) && <Chip size="small" color="secondary" label={t('alchemical')} />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {entry.list.name ? t(entry.list.name, entry.list.name) : entry.list.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {effect ? alchemyEffectText(effect, t) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={choice?.scope ?? 'normal'}
                          disabled={!choice}
                          onChange={(e) => choose(spell.id, { scope: e.target.value as EnchantmentScope })}
                          sx={{ minWidth: 130 }}
                        >
                          {ENCHANTMENT_SCOPES.map((scope) => (
                            <MenuItem key={scope} value={scope}>
                              {t(`enchantment-scope-${scope}`)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        {effect?.kind === 'skill' && (
                          <TextField
                            select
                            size="small"
                            value={choice?.target ?? ''}
                            disabled={!choice}
                            error={!!choice && !choice.target}
                            onChange={(e) => choose(spell.id, { target: e.target.value || null })}
                            sx={{ minWidth: 180 }}
                          >
                            {skillIds(alchemist).map((skillId) => (
                              <MenuItem key={skillId} value={skillId}>
                                {t(skillId)}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
        {selected.length > 0 && !hasAlchemical && (
          <Alert severity="warning">{t('err-enchantment-no-alchemical-spell')}</Alert>
        )}
        {!targetsReady && <Alert severity="warning">{t('enchantment-target-required')}</Alert>}
      </Stack>
    </Panel>,
    <Panel variant="outlined">
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t('enchantment-power-level')}
              value={powerLevel}
              onChange={(e) => setPowerLevel(e.target.value as PowerLevel)}
              helperText={t('enchantment-power-level-hint')}
            >
              {POWER_LEVELS.map((level) => (
                <MenuItem key={level} value={level}>
                  {t(`power-level-${level}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {stack && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2">{t('enchantment-batch-whole-stack', { count: stack })}</Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                {t('enchantment-batch-hint')}
              </Typography>
            </Grid>
          )}
        </Grid>
        {planError ? (
          <Alert severity="error">{t(planError)}</Alert>
        ) : plan ? (
          <EnchantmentPlanView plan={plan} free={payer === 'free'} />
        ) : (
          <LoadingState />
        )}
      </Stack>
    </Panel>,
    plan ? (
      <Panel variant="outlined">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('enchantment-scr-hint')}
          </Typography>
          {plan.spells.map((spell) => {
            const roll = rolls[spell.spellId];
            const total = roll === undefined ? null : roll + spell.scrBonus;
            return (
              <Grid key={spell.spellId} container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={{ fontWeight: 600 }}>{`${spellName(spell.name)} (${spell.level})`}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {spell.scrModifiers
                      .map(
                        (modifier) =>
                          `${modifierLabel(modifier.key)} ${modifier.value >= 0 ? '+' : ''}${modifier.value}`
                      )
                      .join(' · ')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RollField
                    spec={OPEN_D100}
                    label={t('enchantment-scr-roll')}
                    value={roll}
                    onChange={(value) => setRolls((current) => ({ ...current, [spell.spellId]: value.total }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {`${t('enchantment-scr-bonus')}: ${spell.scrBonus >= 0 ? '+' : ''}${spell.scrBonus}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${t('total')}: ${total ?? '—'}`}</Typography>
                    {total !== null && total <= 0 && (
                      <Chip size="small" color="error" label={t('enchantment-scr-failed')} />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            );
          })}
        </Stack>
      </Panel>
    ) : undefined,
  ];

  return (
    <Stack spacing={2}>
      {item && step > 1 && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ItemThumb item={item} size={48} />
          <Stack>
            <Typography sx={{ fontWeight: 600 }}>{t(item.name, item.name)}</Typography>
            {plan && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('enchantment-days-value', { days: plan.workingDays })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('enchantment-paid-at-start')}
                </Typography>
                <MoneyDisplay gold={payer === 'free' ? 0 : plan.paidAtStart} variant="caption" />
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
      <FlowSteps
        activeIndex={step}
        onReview={(id) => id && !busy && setStep(STEPS.indexOf(id))}
        steps={STEPS.map((label, index) => ({
          id: label,
          label: t(label),
          summary: index === 1 && item ? t(item.name, item.name) : undefined,
          content: stepContent[index],
        }))}
        footer={
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
              {t('back')}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="contained" disabled={!canNext} onClick={() => setStep(step + 1)}>
                {t('next')}
              </Button>
            ) : (
              <Button variant="contained" disabled={!canNext} onClick={onStart}>
                {t('enchantment-start')}
              </Button>
            )}
          </Stack>
        }
      />
    </Stack>
  );
};

export default EnchantmentWizard;
