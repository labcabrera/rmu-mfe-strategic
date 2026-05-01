import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useSearchParams } from 'react-router-dom';
import OutboundIcon from '@mui/icons-material/Outbound';
import { Grid, IconButton, TextField, Badge, Paper, Box } from '@mui/material';
import {
  CategorySeparator,
  Character,
  CreateCharacterDto,
  EditableAvatar,
  Faction,
  fetchFaction,
  fetchRaces,
  fetchStrategicGame,
  NumericInput,
  Profession,
  Race,
  RefreshButton,
  RmuSelect,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { defaultStats } from '../../data/character-create';
import { imageBaseUrl } from '../../services/config';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import { randomizeStats } from '../../services/randomize-stats';
import CharacterViewStatsChart from '../view/stats/CharacterViewStatsChart';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateBoostOptionsDialog from './CharacterCreateBoostOptionsDialog';
import CharacterCreateMainForm from './CharacterCreateMainForm';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateSkillCosts from './CharacterCreateSkillCosts';
import { CharacterCreateSortCombat } from './CharacterCreateSortCombat';
import CharacterCreateStats from './CharacterCreateStats';

const defaultImage = `${imageBaseUrl}images/races/unknown-alt.png`;

export const CHARACTER_EMPTY_TEMPLATE = {
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
  imageUrl: `${imageBaseUrl}images/generic/races.png`,
} as unknown as CreateCharacterDto;

export interface StatBonus {
  potential: number;
  temporary: number;
}

export interface StatBonusFormData {
  [key: string]: StatBonus;
}

const CharacterCreate: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();

  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const factionId = searchParams.get('factionId');
  const [faction, setFaction] = useState<Faction>();

  const [game, setGame] = useState<StrategicGame | null>(null);
  const [profession, setProfession] = useState<Profession>();
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race>();

  const [formData, setFormData] = useState<CreateCharacterDto>(CHARACTER_EMPTY_TEMPLATE);
  const [statBonusFormData, setStatBonusFormData] = useState<StatBonusFormData>(defaultStats);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [boostDialogOpen, setBoostDialogOpen] = useState<boolean>(false);

  const onRandomStats = () => {
    randomizeStats(setFormData, setStatBonusFormData);
  };

  const checkValidForm = (formData: CreateCharacterDto) => {
    let valid = true;
    if (!formData.gameId) valid = false;
    if (!formData.name || formData.name.trim() === '') valid = false;
    if (!formData.info?.raceId) valid = false;
    if (!formData.info?.professionId) valid = false;
    if (!formData.info?.realmType) valid = false;
    if (!formData.info?.weight) valid = false;
    if (!formData.level) valid = false;
    setIsValid(valid);
  };

  const bindStrategicGame = () => {
    if (gameId) {
      fetchStrategicGame(gameId, auth)
        .then((game) => setGame(game))
        .catch((err) => showError(err.message));
    }
  };

  const handleWeaponOrderChange = (newOrder: string[]) => {
    setFormData((prevState) => ({
      ...prevState,
      weaponDevelopment: newOrder,
    }));
  };

  useEffect(() => {
    checkValidForm(formData);
  }, [formData]);

  useEffect(() => {
    if (game) {
      fetchRaces(`realmId==${game.realmId}`, 0, 100, auth)
        .then((data) => setRaces(data.content))
        .catch((err) => showError(err.message));
    }
  }, [game]);

  useEffect(() => {
    if (gameId) {
      bindStrategicGame();
      setFormData((prevState) => ({
        ...prevState,
        gameId: gameId,
      }));
    }
  }, [gameId]);

  useEffect(() => {
    if (factionId) {
      fetchFaction(factionId, auth)
        .then((response) => {
          setFaction(response);
          setFormData((prevState) => ({ ...prevState, factionId: factionId }));
        })
        .catch((err) => showError(err.message));
    }
  }, [factionId]);

  if (!game || !formData) return <div>Loading....</div>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={formData.imageUrl || defaultImage}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <CharacterCreateActions formData={formData} game={game} faction={faction} isValid={isValid} />
          <Paper sx={{ p: 2 }}>
            <CharacterCreateMainForm
              formData={formData}
              setFormData={setFormData}
              setProfession={setProfession}
              selectedRace={selectedRace}
              races={races}
              setSelectedRace={setSelectedRace}
              profession={profession}
            />
            <CategorySeparator text={t('Stats')}>
              <RefreshButton onClick={onRandomStats} />
              <Badge badgeContent={2} color="success">
                <IconButton onClick={() => setBoostDialogOpen(true)} color="primary">
                  <OutboundIcon />
                </IconButton>
              </Badge>
            </CategorySeparator>

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

            <CategorySeparator text={t('Weapon development order')} />
            <Grid size={12}>
              <CharacterCreateSortCombat items={formData.weaponDevelopment || []} onChange={handleWeaponOrderChange} />
            </Grid>

            {profession && (
              <Grid size={12}>
                <>
                  <CategorySeparator text={t('skill-development-costs')} />
                  <CharacterCreateSkillCosts profession={profession} />
                  <CategorySeparator text={t('professional-skills')} />
                  <CharacterCreateProfessionalSkills profession={profession} />
                </>
              </Grid>
            )}

            <CategorySeparator text={t('lore')} />
            <Grid size={12}>
              <TextField
                label={t('description')}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                maxRows={4}
              />
            </Grid>
            <Grid size={4}>
              <RmuSelect
                value={formData.roleplay.gender}
                label={t('gender')}
                options={['male', 'female', 'other']}
                onChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, gender: value } }))
                }
              />
            </Grid>
            <Grid size={4}>
              <NumericInput
                label={t('age')}
                name="age"
                value={formData.roleplay.age}
                onChange={(value) => setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, age: value! } }))}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={12}>
              <TechnicalInfo>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </TechnicalInfo>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <CharacterCreateBoostOptionsDialog
        open={boostDialogOpen}
        onClose={() => setBoostDialogOpen(false)}
        strategicGame={game}
        formData={formData}
        setFormData={setFormData}
      />
    </>
  );
};

export default CharacterCreate;
