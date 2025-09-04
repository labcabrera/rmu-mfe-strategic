/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HeightTextField from '../../shared/inputs/HeightTextField';
import NameTextField from '../../shared/inputs/NameTextField';
import WeightTextField from '../../shared/inputs/WeightTextField';
import SelectFaction from '../../shared/selects/SelectFaction';
import SelectGame from '../../shared/selects/SelectGame';
import SelectGender from '../../shared/selects/SelectGender';
import SelectLevel from '../../shared/selects/SelectLevel';
import SelectProfession from '../../shared/selects/SelectProfession';
import SelectRace from '../../shared/selects/SelectRace';
import SelectRealmType from '../../shared/selects/SelectRealmType';
import GameCreateStats from './CharacterCreateStats';

const CharacterCreateAttributes = ({ strategicGame, formData, setFormData }) => {
  const { t } = useTranslation();

  const onRaceChange = (raceId, raceInfo) => {
    if (raceInfo) {
      const stats = { ...formData.statistics };
      const keys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];
      keys.forEach((key) => {
        stats[key].racial = raceInfo.defaultStatBonus[key];
      });
      setFormData((prevState) => ({
        ...prevState,
        info: {
          ...prevState.info,
          raceId: raceId,
          sizeId: raceInfo.size,
          height: raceInfo.averageHeight.male,
          weight: raceInfo.averageWeight.male,
        },
        movement: {
          ...prevState.movement,
          strideRacialBonus: raceInfo.strideBonus,
        },
        statistics: stats,
      }));
    }
  };

  const onProfessionChange = (professionId, professionInfo) => {
    setFormData((prevState) => ({
      ...prevState,
      info: {
        ...prevState.info,
        professionId: professionId,
      },
    }));
  };

  const onLevelChange = (level) => {
    updateFormData('info', 'level', level);
  };

  const onFactionChange = (faction) => {
    console.log('Selected faction:', faction);
    setFormData({ ...formData, factionId: faction });
  };

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    } catch (error) {
      console.log('handleChange error ' + error);
    }
  };

  const handleRealmTypeChange = (realmType) => {
    setFormData((prevState) => ({ ...prevState, info: { ...prevState.info, realmType: realmType } }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prevState) => ({ ...prevState, roleplay: { ...prevState.roleplay, gender: gender } }));
  };

  const handleAgeChange = (age) => {
    let value;
    try {
      value = parseInt(age.target.value);
    } catch (error) {
      value = age;
    }
    setFormData((prevState) => ({ ...prevState, roleplay: { ...prevState.roleplay, age: value } }));
  };

  const handleHeightChange = (e) => updateFormData('info', 'height', e.target.value ? parseInt(e.target.value) : 0);
  const handleWeightChange = (e) => updateFormData('info', 'weight', e.target.value ? parseInt(e.target.value) : 0);

  const onNameChange = (e) => {
    setFormData((prevState) => ({ ...prevState, name: e.target.value }));
  };

  const onGameChange = (gameId, gameInfo) => {
    setFormData((prevState) => ({ ...prevState, gameId: gameId }));
  };

  const updateFormData = (field1, field2, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field1]: {
        ...prevState[field1],
        [field2]: value,
      },
    }));
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('information')}
          </Typography>
        </Grid>

        <Grid item size={3}>
          <SelectGame value={formData.gameId} onChange={onGameChange} />
        </Grid>
        <Grid item size={3}>
          <SelectFaction value={formData.factionId} onChange={onFactionChange} />
        </Grid>
        <Grid item size={3}>
          <SelectRace value={formData.info.raceId} onChange={onRaceChange} />
        </Grid>
        <Grid item size={3}></Grid>

        <Grid item size={3}>
          <SelectProfession value={formData.info.professionId} onChange={onProfessionChange} />
        </Grid>
        <Grid item size={3}>
          <SelectRealmType value={formData.info.realmTypeId} onChange={handleRealmTypeChange} />
        </Grid>
        <Grid item size={3}>
          <SelectLevel value={formData.info.level} onChange={onLevelChange} />
        </Grid>
        <Grid item size={3}></Grid>

        <Grid item size={3}>
          <NameTextField value={formData.name} onChange={onNameChange} generateRandom={true} generateRandomRaceValue={formData.info.raceId} />
        </Grid>
        <Grid item size={9}></Grid>

        <Grid item size={3}>
          <HeightTextField value={formData.info.height} onChange={handleHeightChange} />
        </Grid>
        <Grid item size={3}>
          <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
        </Grid>
        <Grid item size={3}></Grid>
        <GameCreateStats formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('roleplay')}
          </Typography>
        </Grid>
        <Grid item size={9}>
          <TextField
            label="Description"
            variant="standard"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            maxRows={4}
          />
        </Grid>
        <Grid size={3}></Grid>
        <Grid size={3}>
          <SelectGender value={formData.roleplay.gender} onChange={handleGenderChange} />
        </Grid>
        <Grid size={3}>
          <TextField label="Gender" value={formData.roleplay.age} onChange={handleAgeChange} fullWidth />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterCreateAttributes;
