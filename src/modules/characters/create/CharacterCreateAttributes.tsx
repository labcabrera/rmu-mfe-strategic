import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField, Typography } from '@mui/material';
import { CreateCharacterDto } from '../../api/characters';
import { Profession } from '../../api/professions';
import { Race } from '../../api/races';
import { StrategicGame } from '../../api/strategic-games';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import NameTextField from '../../shared/inputs/NameTextField';
import { NumericInput } from '../../shared/inputs/NumericInput';
import SelectFaction from '../../shared/selects/SelectFaction';
import SelectGame from '../../shared/selects/SelectGame';
import SelectGender from '../../shared/selects/SelectGender';
import SelectProfession from '../../shared/selects/SelectProfession';
import SelectRace from '../../shared/selects/SelectRace';
import SelectRealmType from '../../shared/selects/SelectRealmType';
import GameCreateStats from './CharacterCreateStats';

const CharacterCreateAttributes: FC<{
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
}> = ({ strategicGame, formData, setFormData }) => {
  const { t } = useTranslation();

  const onRaceChange = (raceId: string, raceInfo: Race) => {
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

  const onProfessionChange = (professionId: string, profession: Profession) => {
    let realmType = formData.info.realmType;
    if (profession && profession.realmType) {
      realmType = profession.realmType;
    }
    setFormData((prevState) => ({
      ...prevState,
      info: {
        ...prevState.info,
        professionId: professionId,
        realmType: realmType,
      },
    }));
  };

  const onFactionChange = (faction: string) => {
    setFormData({ ...formData, factionId: faction });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    } catch (error) {
      console.log('handleChange error ' + error);
    }
  };

  const handleRealmTypeChange = (realmType: string) => {
    setFormData((prevState) => ({
      ...prevState,
      info: { ...prevState.info, realmType: realmType },
    }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prevState) => ({
      ...prevState,
      roleplay: { ...prevState.roleplay, gender: gender },
    }));
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({ ...prevState, name: e.target.value }));
  };

  const onGameChange = (gameId: string, gameInfo: any) => {
    setFormData((prevState) => ({ ...prevState, gameId: gameId }));
  };

  const updateField = (field: string, value: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateFormData = (field1: string, field2: string, value: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [field1]: {
        ...prevState[field1],
        [field2]: value,
      },
    }));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <CharacterAvatar character={formData} size={120} />
      </Grid>
      <Grid size={6}>
        <Grid size={12}>
          <SelectGame value={formData.gameId} onChange={onGameChange} />
        </Grid>
        <Grid size={12}>
          <SelectFaction value={formData.factionId} onChange={onFactionChange} />
        </Grid>
      </Grid>
      <Grid size={12}>
        <NameTextField value={formData.name} onChange={onNameChange} generateRandomRaceValue={formData.info.raceId} />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('information')}
        </Typography>
      </Grid>

      <Grid size={6}>
        <SelectRace value={formData.info.raceId} onChange={onRaceChange} />
      </Grid>
      <Grid size={6}>
        <SelectProfession value={formData.info.professionId} onChange={onProfessionChange} />
      </Grid>
      <Grid size={6}>
        <SelectRealmType value={formData.info.realmType} onChange={handleRealmTypeChange} />
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('level')}
          name="level"
          value={formData.level}
          onChange={(e: any) => updateField('level', e)}
          integer
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={6}>
        <NumericInput
          label={t('height')}
          name="height"
          value={formData.info.height}
          onChange={(e: any) => updateFormData('info', 'height', e)}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('weight')}
          name="weight"
          value={formData.info.weight}
          onChange={(e: any) => updateFormData('info', 'weight', e)}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('roleplay')}
        </Typography>
      </Grid>
      <Grid size={6}>
        <SelectGender value={formData.roleplay.gender} onChange={handleGenderChange} />
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('age')}
          name="age"
          value={formData.roleplay.age}
          onChange={(e: any) => updateFormData('roleplay', 'age', e)}
          integer
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}>
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
    </Grid>
  );
};

export default CharacterCreateAttributes;
