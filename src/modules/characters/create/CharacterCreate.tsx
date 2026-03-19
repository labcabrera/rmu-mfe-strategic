import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OutboundIcon from '@mui/icons-material/Outbound';
import { Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Box, Button, TextField } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto } from '../../api/character.dto';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { fetchRaces } from '../../api/race';
import { Race } from '../../api/race.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { CHARACTER_CREATION_TEMPLATE } from '../../data/character-create';
import { imageBaseUrl } from '../../services/config';
import { randomizeStats } from '../../services/randomize-stats';
import EditableAvatar from '../../shared/avatars/EditableAvatar';
import RefreshButton from '../../shared/buttons/RefreshButton';
import CategorySeparator from '../../shared/display/CategorySeparator';
import TechnicalInfo from '../../shared/display/TechnicalInfo';
import CharacterViewStatsChart from '../view/CharacterViewStatsChart';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateBoostOptionsDialog from './CharacterCreateBoostOptionsDialog';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateResume from './CharacterCreateResume';
import CharacterCreateSkillCosts from './CharacterCreateSkillCosts';
import { CharacterCreateSortCombat } from './CharacterCreateSortCombat';
import CharacterCreateStats from './CharacterCreateStats';

const defaultImage = `${imageBaseUrl}images/races/unknown-alt.png`;

export interface StatBonus {
  potential: number;
  temporary: number;
}

export interface StatBonusFormData {
  [key: string]: StatBonus;
}

const CharacterCreate: FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const factionId = searchParams.get('factionId');
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [formData, setFormData] = useState<CreateCharacterDto>(CHARACTER_CREATION_TEMPLATE);
  const [statBonusFormData, setStatBonusFormData] = useState<StatBonusFormData>({
    ag: { potential: 0, temporary: 0 },
    co: { potential: 0, temporary: 0 },
    em: { potential: 0, temporary: 0 },
    in: { potential: 0, temporary: 0 },
    me: { potential: 0, temporary: 0 },
    pr: { potential: 0, temporary: 0 },
    qu: { potential: 0, temporary: 0 },
    re: { potential: 0, temporary: 0 },
    sd: { potential: 0, temporary: 0 },
    st: { potential: 0, temporary: 0 },
  });
  const [profession, setProfession] = useState<Profession | null>(null);
  const [boosts, setBoosts] = useState<number>(game?.powerLevel.statCreationBoost || 2);
  const [swaps, setSwaps] = useState<number>(game?.powerLevel.statCreationSwap || 2);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [boostDialogOpen, setBoostDialogOpen] = useState<boolean>(false);

  const onRandomStats = () => {
    randomizeStats(setFormData, setStatBonusFormData);
    setBoosts(game?.powerLevel.statCreationBoost || 2);
    setSwaps(game?.powerLevel.statCreationSwap || 2);
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
    if (!gameId) return;
    fetchStrategicGame(gameId)
      .then((game) => setGame(game))
      .catch((err) => showError(err.message));
    fetchFactions(`gameId==${gameId}`, 0, 20)
      .then((factions) => {
        setFactions(factions);
        setFaction(factions.find((f) => f.id === factionId) || null);
      })
      .catch((err) => showError(err.message));
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
      fetchRaces(`realm.id==${game.realmId}`, 0, 100)
        .then((data) => setRaces(data))
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
      setFormData((prevState) => ({
        ...prevState,
        factionId: factionId,
      }));
    }
  }, [factionId]);

  if (!game || !formData || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterCreateActions formData={formData} game={game} faction={faction} isValid={isValid} />

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2 }}>
          <EditableAvatar
            imageUrl={formData.imageUrl || defaultImage}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
          <CharacterCreateResume
            formData={formData}
            setFormData={setFormData}
            setProfession={setProfession}
            factions={factions}
            races={races}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <CategorySeparator text={t('stats')}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <RefreshButton onClick={onRandomStats} />
              <IconButton onClick={() => setBoostDialogOpen(true)} color="primary">
                <OutboundIcon />
              </IconButton>
            </Box>
          </CategorySeparator>

          <Grid container spacing={1}>
            <Grid size={5}>
              <CharacterCreateStats formData={formData} statBonusFormData={statBonusFormData} />
            </Grid>
            <Grid size={5} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CharacterViewStatsChart stats={formData.statistics} />
            </Grid>
          </Grid>

          <CategorySeparator text={t('weapon-development-order')} />
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

          <Grid size={12} mt={2}>
            <TechnicalInfo>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </TechnicalInfo>
          </Grid>
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
