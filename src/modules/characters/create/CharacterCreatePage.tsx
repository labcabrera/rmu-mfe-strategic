/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OutboundIcon from '@mui/icons-material/Outbound';
import { Grid, IconButton, Badge, Box, Typography } from '@mui/material';
import {
  Character,
  createCharacter,
  CreateCharacterDto,
  Culture,
  EditableAvatar,
  ErrorState,
  Faction,
  fetchCultures,
  fetchFaction,
  fetchRaces,
  fetchSkills,
  fetchStrategicGame,
  FormPage,
  imageBaseUrl,
  LoadingState,
  NotFound,
  Profession,
  Race,
  RefreshButton,
  Section,
  Skill,
  STATS,
  StrategicGame,
  TechnicalInfo,
  useEntity,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  CultureAssignmentRow,
  isCultureValid,
  toAssignments,
  validateCulture,
} from '../../services/culture-assignments';
import { resolveOptions, resolvePowerLevel } from '../../services/game-rules';
import { useStrategicNotify } from '../../services/notify-service';
import { CreationStats, randomizePointBuyStats, randomizeStats } from '../../services/randomize-stats';
import { safeStatBonus } from '../../services/stat-service';
import StrategicGamePicker from '../../shared/StrategicGamePicker';
import CharacterViewStatsChart from '../view/stats/CharacterViewStatsChart';
import CharacterCreateBoostOptionsDialog, {
  initialStatCreationBudget,
  StatCreationBudget,
} from './CharacterCreateBoostOptionsDialog';
import CharacterCreateCulture, { initialCultureRows } from './CharacterCreateCulture';
import CharacterCreateLore from './CharacterCreateLore';
import CharacterCreateMainForm from './CharacterCreateMainForm';
import CharacterCreatePointBuy, { pointBuySpent } from './CharacterCreatePointBuy';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateSkillCosts from './CharacterCreateSkillCosts';
import CharacterCreateSortCombat from './CharacterCreateSortCombat';
import CharacterCreateStats from './CharacterCreateStats';

const defaultImage = `${imageBaseUrl}images/races/unknown-alt.png`;

const CHARACTER_EMPTY_TEMPLATE = {
  name: '',
  gameId: '',
  factionId: '',
  info: {
    raceId: '',
    professionId: '',
    realmTypes: [] as string[],
    height: 7,
    weight: 120,
  },
  roleplay: {
    gender: 'male',
    age: 20,
  },
  level: 1,
  weaponDevelopment: ['melee', 'ranged', 'shield', 'unarmed'],
  statistics: {
    ag: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    co: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    em: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    in: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    me: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    pr: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    qu: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    re: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    sd: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    st: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
  },
  movement: {
    strideCustomBonus: 1,
  },
  defense: {},
  endurance: {
    customBonus: 5,
  },
  power: {
    max: 0,
  },
  initiative: {
    customBonus: 1,
  },
  skills: [
    {
      skillId: 'body-development',
      ranks: 0,
    },
    {
      skillId: 'armor-maneuver',
      ranks: 0,
    },
    {
      skillId: 'perception',
      ranks: 0,
    },
    {
      skillId: 'jumping',
      ranks: 0,
    },
    {
      skillId: 'running',
      ranks: 0,
    },
    {
      skillId: 'leadership',
      ranks: 0,
    },
    {
      skillId: 'medicine',
      ranks: 0,
    },
  ],
  items: [],
  description: '',
  imageUrl: 'images/generic/races.png',
} as unknown as CreateCharacterDto;

export interface StatBonus {
  potential: number;
  temporary: number;
}

export interface StatBonusFormData {
  [key: string]: StatBonus;
}

/**
 * Character creation wizard. It needs the strategic game (`gameId` query param) and asks for it when
 * it is missing; `factionId` is optional.
 */
export default function CharacterCreatePage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useStrategicNotify();

  const [searchParams, setSearchParams] = useSearchParams();
  const gameId = searchParams.get('gameId') || undefined;
  const factionId = searchParams.get('factionId') || undefined;
  const initialFaction: Faction | undefined = location.state?.faction;
  const gameState = useEntity<StrategicGame>(gameId, (id) => fetchStrategicGame(id, auth), { onError: notify.error });
  const factionState = useEntity<Faction>(factionId, (id) => fetchFaction(id, auth), {
    initial: initialFaction && initialFaction.id === factionId ? initialFaction : undefined,
    onError: notify.error,
  });
  const game = gameState.entity;
  const faction = factionState.entity;

  const [profession, setProfession] = useState<Profession>();
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race>();

  const [formData, setFormData] = useState<CreateCharacterDto>(CHARACTER_EMPTY_TEMPLATE);
  const [boostDialogOpen, setBoostDialogOpen] = useState<boolean>(false);
  const [statBudget, setStatBudget] = useState<StatCreationBudget>({ boosts: 0, swaps: 0, gainRolls: 0 });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [culture, setCulture] = useState<Culture>();
  const [cultureRows, setCultureRows] = useState<CultureAssignmentRow[]>([]);

  const powerLevel = resolvePowerLevel(game?.powerLevel);
  const pointBuy = resolveOptions(game?.options).statGeneration === 'point-buy';

  const statBonusFormData = useMemo<StatBonusFormData>(() => {
    const bonuses: StatBonusFormData = {};
    STATS.forEach((key) => {
      const stat = formData.statistics[key];
      bonuses[key] = { potential: safeStatBonus(stat?.potential), temporary: safeStatBonus(stat?.temporary) };
    });
    return bonuses;
  }, [formData.statistics]);

  const cultureValidation = useMemo(
    () => validateCulture(culture, cultureRows, skills),
    [culture, cultureRows, skills]
  );

  const setStatistics = (statistics: CreationStats) => setFormData((prev) => ({ ...prev, statistics }));

  const onRandomStats = () => {
    setFormData((prev) => ({
      ...prev,
      statistics: pointBuy
        ? randomizePointBuyStats(prev.statistics, powerLevel.statRandomMin)
        : randomizeStats(prev.statistics, powerLevel.statRandomMin),
    }));
    // New rolls get the boosts and swaps of the power level again
    if (game) setStatBudget(initialStatCreationBudget(game));
  };

  const onCultureChange = (selected: Culture | undefined) => {
    setCulture(selected);
    setCultureRows(initialCultureRows(selected, skills));
  };

  const statsValid = STATS.every((key) => formData.statistics[key].temporary <= formData.statistics[key].potential);
  const pointBuyValid = !pointBuy || pointBuySpent(formData.statistics) <= powerLevel.statPoints;

  const isValid =
    !!formData.gameId &&
    !!formData.name &&
    !!formData.info?.raceId &&
    !!formData.info?.professionId &&
    (formData.info?.realmTypes?.length ?? 0) > 0 &&
    !!formData.info?.weight &&
    !!formData.level &&
    statsValid &&
    pointBuyValid &&
    (!culture || isCultureValid(cultureValidation));

  const onCreate = () => {
    const request: CreateCharacterDto = culture
      ? { ...formData, culture: { cultureId: culture.id, assignments: toAssignments(culture, cultureRows, skills) } }
      : formData;
    const dto = request as unknown as Partial<Character>;
    createCharacter(dto, auth)
      .then((data) => navigate('/strategic/characters/view/' + data.id, { state: { character: data, game: game } }))
      .catch(notify.error);
  };

  const onCancel = () => navigate(factionId ? `/strategic/factions/view/${factionId}` : '/strategic/characters');

  const handleWeaponOrderChange = (newOrder: string[]) => {
    setFormData((prevState) => ({
      ...prevState,
      weaponDevelopment: newOrder,
    }));
  };

  useEffect(() => {
    if (game) {
      fetchRaces(`realmId==${game.realmId}`, 0, 100, auth)
        .then((data) => setRaces(data.content))
        .catch(notify.error);
    }
  }, [game]);

  useEffect(() => {
    if (game) setStatBudget(initialStatCreationBudget(game));
  }, [game]);

  useEffect(() => {
    fetchCultures('', 0, 100, auth)
      .then((data) => setCultures(data.content))
      .catch(notify.error);
    fetchSkills('', 0, 500, auth)
      .then((data) => setSkills(data.content))
      .catch(notify.error);
  }, []);

  useEffect(() => {
    if (gameId) setFormData((prevState) => ({ ...prevState, gameId }));
  }, [gameId]);

  useEffect(() => {
    if (faction) setFormData((prevState) => ({ ...prevState, factionId: faction.id }));
  }, [faction]);

  const breadcrumbs = [
    { name: t('home'), link: '/' },
    { name: t('strategic-module'), link: '/strategic' },
    { name: t('characters'), link: '/strategic/characters' },
    { name: t('create') },
  ];

  if (!gameId)
    return (
      <StrategicGamePicker
        breadcrumbs={breadcrumbs}
        message={t('select-campaign-to-continue')}
        onCancel={() => navigate('/strategic/characters')}
        onSelect={(id) =>
          setSearchParams((params) => {
            params.set('gameId', id);
            return params;
          })
        }
      />
    );

  if (!game) {
    let state = <LoadingState variant="detail" />;
    if (gameState.notFound) state = <NotFound />;
    else if (gameState.error) state = <ErrorState error={gameState.error} onRetry={gameState.refresh} />;
    return (
      <FormPage breadcrumbs={breadcrumbs} onSave={onCreate} onCancel={onCancel} saveDisabled>
        {state}
      </FormPage>
    );
  }

  return (
    <FormPage
      breadcrumbs={breadcrumbs}
      onSave={onCreate}
      onCancel={onCancel}
      saveDisabled={!isValid}
      dirty={!!formData.name}
      leftPanel={
        <>
          <EditableAvatar
            imageUrl={formData.imageUrl || defaultImage}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
          <Typography>{faction?.name}</Typography>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <Section title={t('character')}>
            <CharacterCreateMainForm
              formData={formData}
              setFormData={setFormData}
              setProfession={setProfession}
              selectedRace={selectedRace}
              races={races}
              setSelectedRace={setSelectedRace}
              profession={profession}
            />
          </Section>
        </Grid>
        <Grid size={12}>
          <Section
            title={t('statistics')}
            actions={
              <>
                <RefreshButton onClick={onRandomStats} />
                {!pointBuy && (
                  <Badge badgeContent={statBudget.boosts + statBudget.swaps + statBudget.gainRolls} color="success">
                    <IconButton
                      onClick={() => setBoostDialogOpen(true)}
                      color="primary"
                      aria-label={t('statistics-boosts')}
                    >
                      <OutboundIcon />
                    </IconButton>
                  </Badge>
                )}
              </>
            }
          >
            <Grid container spacing={1}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  {pointBuy
                    ? t('stat-generation-point-buy-help', {
                        min: powerLevel.statRandomMin,
                        points: powerLevel.statPoints,
                      })
                    : t('stat-generation-roll-help', { min: powerLevel.statRandomMin })}
                </Typography>
              </Grid>
              {pointBuy && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <CharacterCreatePointBuy
                    statistics={formData.statistics}
                    statPoints={powerLevel.statPoints}
                    onChange={setStatistics}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <CharacterCreateStats formData={formData} statBonusFormData={statBonusFormData} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Box sx={{ flex: 1 }}>
                  <CharacterViewStatsChart stats={formData.statistics} minHeight={320} />
                </Box>
              </Grid>
            </Grid>
          </Section>
        </Grid>
        <Grid size={12}>
          <Section title={t('weapon-development-order')}>
            <CharacterCreateSortCombat items={formData.weaponDevelopment || []} onChange={handleWeaponOrderChange} />
          </Section>
        </Grid>
        <Grid size={12}>
          <Section title={t('culture')}>
            <CharacterCreateCulture
              realmId={game.realmId}
              cultures={cultures}
              culture={culture}
              onCultureChange={onCultureChange}
              rows={cultureRows}
              setRows={setCultureRows}
              skills={skills}
              validation={cultureValidation}
              onError={notify.error}
            />
          </Section>
        </Grid>
        <Grid size={12}>
          <Section title={t('lore')}>
            <CharacterCreateLore formData={formData} setFormData={setFormData} />
          </Section>
        </Grid>
        {profession && (
          <>
            <Grid size={12}>
              <Section title={t('skill-development-costs')}>
                <CharacterCreateSkillCosts profession={profession} />
              </Section>
            </Grid>
            <Grid size={12}>
              <Section title={t('professional-skills')}>
                <CharacterCreateProfessionalSkills profession={profession} />
              </Section>
            </Grid>
          </>
        )}
      </Grid>

      <CharacterCreateBoostOptionsDialog
        open={boostDialogOpen}
        onClose={() => setBoostDialogOpen(false)}
        strategicGame={game}
        statistics={formData.statistics}
        onChange={setStatistics}
        budget={statBudget}
        setBudget={setStatBudget}
      />
      <TechnicalInfo>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </TechnicalInfo>
    </FormPage>
  );
}
