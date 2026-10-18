/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OutboundIcon from '@mui/icons-material/Outbound';
import { Grid, IconButton, Badge, Box, Typography } from '@mui/material';
import {
  Character,
  createCharacter,
  CreateCharacterDto,
  EditableAvatar,
  ErrorState,
  Faction,
  fetchFaction,
  fetchRaces,
  fetchStrategicGame,
  FormPage,
  imageBaseUrl,
  LoadingState,
  NotFound,
  Profession,
  Race,
  RefreshButton,
  Section,
  StrategicGame,
  TechnicalInfo,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultStats } from '../../data/character-create';
import { randomizeStats } from '../../services/randomize-stats';
import StrategicGamePicker from '../../shared/StrategicGamePicker';
import CharacterViewStatsChart from '../view/stats/CharacterViewStatsChart';
import CharacterCreateBoostOptionsDialog from './CharacterCreateBoostOptionsDialog';
import CharacterCreateLore from './CharacterCreateLore';
import CharacterCreateMainForm from './CharacterCreateMainForm';
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
    realmType: '',
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
  const notify = useNotify();

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
  const [statBonusFormData, setStatBonusFormData] = useState<StatBonusFormData>(defaultStats);
  const [boostDialogOpen, setBoostDialogOpen] = useState<boolean>(false);

  const onRandomStats = () => {
    randomizeStats(setFormData, setStatBonusFormData);
  };

  const isValid =
    !!formData.gameId &&
    !!formData.name &&
    !!formData.info?.raceId &&
    !!formData.info?.professionId &&
    !!formData.info?.realmType &&
    !!formData.info?.weight &&
    !!formData.level;

  const onCreate = () => {
    const dto = formData as unknown as Partial<Character>;
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
                <Badge badgeContent={2} color="success">
                  <IconButton onClick={() => setBoostDialogOpen(true)} color="primary">
                    <OutboundIcon />
                  </IconButton>
                </Badge>
              </>
            }
          >
            <Grid container spacing={1}>
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
        formData={formData}
        setFormData={setFormData}
      />
      <TechnicalInfo>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </TechnicalInfo>
    </FormPage>
  );
}
