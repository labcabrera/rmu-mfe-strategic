import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { CreateCharacterDto } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { Race } from '../../api/race.dto';
import NameTextField from '../../shared/inputs/NameTextField';
import NumericInput from '../../shared/inputs/NumericInput';
import SelectFaction from '../../shared/selects/SelectFaction';
import SelectGame from '../../shared/selects/SelectGame';
import SelectProfession from '../../shared/selects/SelectProfession';
import SelectRace from '../../shared/selects/SelectRace';
import SelectRealmType from '../../shared/selects/SelectRealmType';

const CharacterCreateResume: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  setProfession: Dispatch<SetStateAction<Profession | null>>;
  factions: Faction[];
  races: Race[];
}> = ({ formData, setFormData, setProfession, factions, races }) => {
  const onRaceChange = (race: Race) => {
    if (race) {
      const stats = { ...formData.statistics };
      const keys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];
      keys.forEach((key) => {
        stats[key].racial = race.stats[key];
      });
      setFormData((prevState) => ({
        ...prevState,
        info: {
          ...prevState.info,
          raceId: race.id,
          raceName: race.name,
          sizeId: race.sizeId,
          height: race.averageHeight.male,
          weight: race.averageWeight.male,
        },
        movement: {
          ...prevState.movement,
          strideRacialBonus: race.strideBonus,
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
    setProfession(profession);
  };

  const handleRealmTypeChange = (realmType: string) => {
    setFormData((prevState) => ({
      ...prevState,
      info: { ...prevState.info, realmType: realmType },
    }));
  };

  const onFactionChange = (faction: string) => {
    setFormData({ ...formData, factionId: faction });
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

  if (!races) return <p>Loading...</p>;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <NameTextField
          label={t('name')}
          value={formData.name}
          onChange={onNameChange}
          generateRandomRaceValue={formData.info.raceName}
        />
      </Grid>
      <Grid size={12}>
        <SelectGame value={formData.gameId} onChange={onGameChange} />
      </Grid>
      <Grid size={12}>
        <SelectFaction value={formData.factionId} onChange={onFactionChange} factions={factions} />
      </Grid>
      <Grid size={12}>
        <SelectRace label={t('race')} value={formData.info.raceId} onChange={onRaceChange} races={races} />
      </Grid>
      <Grid size={12}>
        <SelectProfession value={formData.info.professionId} onChange={onProfessionChange} />
      </Grid>
      <Grid size={12}>
        <SelectRealmType value={formData.info.realmType} onChange={handleRealmTypeChange} />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('level')}
          name="level"
          value={formData.level}
          onChange={(e: any) => updateField('level', e)}
          integer
          allowNegatives={false}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterCreateResume;
