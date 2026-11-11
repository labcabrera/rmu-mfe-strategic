/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Character,
  DataTable,
  difficultyCodeKey,
  EntityPicker,
  EnumPicker,
  fetchItems,
  formatBonus,
  HERB_BIOMES,
  HERB_SEARCH_SKILLS,
  HerbBiome,
  HerbSearchOutcome,
  HerbSearchResult,
  HerbSearchSkill,
  Item,
  NumericInput,
  OPEN_D100,
  RmuDialog,
  RollField,
  RollModifier,
  RollValue,
  searchCharacterHerbs,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { useBusyAction } from '../../../shared/useBusyAction';
import { HERBALISM_SKILL } from './health-rules';

const REGION_LORE_SKILL = 'region-lore';
const NO_ITEMS: Item[] = [];

const RESULT_COLORS: Record<HerbSearchOutcome, 'success' | 'default' | 'error' | 'warning'> = {
  found: 'success',
  'not-found': 'default',
  'absolute-failure': 'error',
  'not-here': 'warning',
};

/** Ranks of the best skill of the character with that id (any specialization). */
const bestRanks = (character: Character, skillId: string): number =>
  Math.max(0, ...character.skills.filter((skill) => skill.skillId === skillId).map((skill) => skill.ranks));

/**
 * Complementary skills of Core Law (p. 85): the ranks of the first are added, the next one adds half. The best one
 * goes first.
 */
const complementaryModifiers = (entries: { key: string; ranks: number }[]): RollModifier[] =>
  [...entries]
    .sort((a, b) => b.ranks - a.ranks)
    .map((entry, index) => ({ key: entry.key, value: index === 0 ? entry.ranks : Math.floor(entry.ranks / 2) }))
    .filter((entry) => entry.value > 0);

/**
 * A search for herbs of Treasure Law 2.3 (spec 062): the biome, the herbs sought (from the catalog, those of the
 * biome), an absolute Perception or Survival maneuver with Herbalism and Region Lore as complementary skills, the
 * previous searches and a familiar area. The server resolves each herb and adds the doses found to the character.
 */
const HerbSearchDialog: FC<{
  character: Character;
  open: boolean;
  onClose: () => void;
  onDone?: (result: HerbSearchResult) => void;
}> = ({ character, open, onClose, onDone }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const [biome, setBiome] = useState<HerbBiome | null>(null);
  const [highAltitude, setHighAltitude] = useState(false);
  const [herbIds, setHerbIds] = useState<string[]>([]);
  const [skillId, setSkillId] = useState<HerbSearchSkill>('perception');
  const [skillKey, setSkillKey] = useState('');
  const [roll, setRoll] = useState<RollValue | null>(null);
  const [previousSearches, setPreviousSearches] = useState<number | null>(0);
  const [familiar, setFamiliar] = useState(false);
  const [herbalism, setHerbalism] = useState(false);
  const [regionLore, setRegionLore] = useState(false);
  const [extra, setExtra] = useState<number | null>(null);
  const [result, setResult] = useState<HerbSearchResult>();
  const { busy: saving, run } = useBusyAction();

  useEffect(() => {
    if (!open) return;
    setResult(undefined);
    setRoll(null);
    setHerbIds([]);
  }, [open]);

  const catalogQuery = useQuery({
    queryKey: ['herb-catalog'],
    queryFn: () =>
      fetchItems('category==herb', 0, 1000, auth).then((page) => page.content.filter((item) => item.features?.herb)),
    enabled: open,
    gcTime: 0,
    // A catalog: read once while the dialog is mounted
    staleTime: Infinity,
  });
  const catalog = catalogQuery.data ?? NO_ITEMS;

  useEffect(() => {
    if (catalogQuery.error) notify.error(catalogQuery.error);
  }, [catalogQuery.error]);

  // The herbs of the biome; the ones of high altitude only up there
  const herbs = useMemo(
    () =>
      biome
        ? catalog
            .filter((item) => item.features!.herb!.biomes.includes(biome))
            .filter((item) => highAltitude || !item.features!.herb!.highAltitude)
            .sort((a, b) => t(a.name, a.name).localeCompare(t(b.name, b.name)))
        : [],
    [catalog, biome, highAltitude, t]
  );

  useEffect(() => setHerbIds((ids) => ids.filter((id) => herbs.some((herb) => herb.id === id))), [herbs]);

  // The skill of the character: the plain one and each specialization (Survival of a region...)
  const skills = character.skills.filter((skill) => skill.skillId === skillId);
  const skill = skills.find((each) => each.id === skillKey) ?? skills[0];
  useEffect(() => setSkillKey(skills[0]?.id ?? ''), [skillId]);

  const modifiers: RollModifier[] = [
    ...complementaryModifiers([
      ...(herbalism ? [{ key: HERBALISM_SKILL, ranks: bestRanks(character, HERBALISM_SKILL) }] : []),
      ...(regionLore ? [{ key: REGION_LORE_SKILL, ranks: bestRanks(character, REGION_LORE_SKILL) }] : []),
    ]),
    ...(extra ? [{ key: 'other-modifier', value: extra }] : []),
  ];

  const ready = !!biome && herbIds.length > 0 && roll !== null && previousSearches !== null;

  const save = () => {
    if (!biome || roll === null) return;
    run(
      searchCharacterHerbs(
        character.id,
        {
          biome,
          highAltitude,
          herbItemTypeIds: herbIds,
          skillId,
          ...(skill?.specialization ? { specialization: skill.specialization } : {}),
          roll: roll.total,
          ...(roll.unmodified !== undefined ? { unmodifiedRoll: roll.unmodified } : {}),
          ...(modifiers.length ? { modifiers } : {}),
          previousSearches: previousSearches ?? 0,
          familiar,
        },
        auth
      ),
      (response) => {
        setResult(response);
        onDone?.(response);
      }
    );
  };

  const herbName = (id: string) => {
    const item = catalog.find((each) => each.id === id);
    return item ? t(item.name, item.name) : id;
  };
  const found = result?.herbs.reduce((sum, entry) => sum + (entry.result === 'found' ? entry.doses : 0), 0) ?? 0;

  return (
    <RmuDialog
      open={open}
      title={t('herb-search')}
      subtitle={character.name}
      maxWidth="md"
      onCancel={onClose}
      onConfirm={result ? undefined : save}
      onConfirmDisabled={saving || !ready}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <EnumPicker
              label={t('herb-search-biome')}
              values={HERB_BIOMES}
              labelPrefix="npc-biome-"
              value={biome}
              required
              onChange={(value) => setBiome((value as HerbBiome | null) ?? null)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={<Switch checked={highAltitude} onChange={(_, checked) => setHighAltitude(checked)} />}
              label={t('herb-high-altitude')}
            />
          </Grid>
          <Grid size={12}>
            <EntityPicker
              mode="multiple"
              kind="item"
              hideImages
              label={t('herb-search-herbs')}
              emptyText={biome ? t('herb-search-no-herbs') : t('herb-search-pick-biome')}
              options={herbs.map((item) => {
                const herb = item.features!.herb!;
                return {
                  id: item.id,
                  label: t(item.name, item.name),
                  secondary: [t(difficultyCodeKey(herb.find)), herb.season].filter(Boolean).join(' · '),
                  group: t(`herb-group-${herb.group}`),
                };
              })}
              value={herbIds}
              onChange={(ids) => setHerbIds(ids)}
            />
            {herbIds.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                {t('herb-search-several-hint', { count: herbIds.length, value: herbIds.length * 2 })}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('skill')}
              value={skillId}
              onChange={(e) => setSkillId(e.target.value as HerbSearchSkill)}
            >
              {HERB_SEARCH_SKILLS.map((each) => (
                <MenuItem key={each} value={each}>
                  {t(each)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {skills.length > 1 ? (
              <TextField
                select
                fullWidth
                size="small"
                label={t('specialization')}
                value={skill?.id ?? ''}
                onChange={(e) => setSkillKey(e.target.value)}
              >
                {skills.map((each) => (
                  <MenuItem key={each.id} value={each.id}>
                    {`${each.specialization ? t(each.specialization, each.specialization) : t(each.skillId)} (${formatBonus(each.totalBonus)})`}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                {skill
                  ? t('herb-search-skill-bonus', { value: formatBonus(skill.totalBonus) })
                  : t('herb-search-no-skill')}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RollField spec={OPEN_D100} value={roll} onChange={setRoll} onClear={() => setRoll(null)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('herb-search-previous')}
              value={previousSearches}
              onChange={setPreviousSearches}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumericInput integer label={t('other-modifier')} value={extra} onChange={setExtra} />
          </Grid>
          <Grid size={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormControlLabel
                control={<Checkbox checked={familiar} onChange={(_, checked) => setFamiliar(checked)} />}
                label={t('herb-search-familiar')}
              />
              <FormControlLabel
                control={<Checkbox checked={herbalism} onChange={(_, checked) => setHerbalism(checked)} />}
                label={t('herb-search-complementary', {
                  skill: t(HERBALISM_SKILL),
                  ranks: bestRanks(character, HERBALISM_SKILL),
                })}
              />
              <FormControlLabel
                control={<Checkbox checked={regionLore} onChange={(_, checked) => setRegionLore(checked)} />}
                label={t('herb-search-complementary', {
                  skill: t(REGION_LORE_SKILL),
                  ranks: bestRanks(character, REGION_LORE_SKILL),
                })}
              />
            </Stack>
            {modifiers.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {modifiers.map((entry) => `${t(entry.key)} ${formatBonus(entry.value)}`).join(' · ')}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Alert severity="info">{t('herb-search-rules-hint')}</Alert>
        {result && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              {t('herb-search-result', { doses: found, hours: result.hours })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('herb-search-base', { roll: result.roll, bonus: formatBonus(result.bonus), base: result.base })}
            </Typography>
            {result.unusualEvent && <Alert severity="warning">{t('unusual-event')}</Alert>}
            <DataTable
              rows={result.herbs}
              getKey={(entry) => entry.itemTypeId}
              columns={[
                {
                  key: 'herb',
                  header: t('item-category-herb'),
                  render: (entry) => t(entry.name, herbName(entry.itemTypeId)),
                },
                {
                  key: 'difficulty',
                  header: t('difficulty'),
                  align: 'right',
                  render: (entry) => (entry.difficulty ? t(difficultyCodeKey(entry.difficulty)) : '-'),
                },
                {
                  key: 'total',
                  header: t('total'),
                  align: 'right',
                  render: (entry) => (entry.result === 'not-here' ? '-' : entry.total),
                },
                {
                  key: 'result',
                  header: t('result'),
                  render: (entry) => (
                    <Chip
                      size="small"
                      color={RESULT_COLORS[entry.result]}
                      label={t(`herb-search-result-${entry.result}`)}
                    />
                  ),
                },
                {
                  key: 'doses',
                  header: t('herb-search-doses'),
                  align: 'right',
                  render: (entry) =>
                    entry.result === 'found' ? `${entry.doses}${entry.d10 ? ` (d10 ${entry.d10})` : ''}` : '-',
                },
              ]}
            />
          </Stack>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default HerbSearchDialog;
