import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CreateCharacterDto } from '../../api/character.dto';
import { Profession } from '../../api/professions';
import { Race } from '../../api/race.dto';
import NameTextField from '../../shared/inputs/NameTextField';
import RmuSelect from '../../shared/selects/RmuSelect';
import SelectProfession from '../../shared/selects/SelectProfession';
import SelectRace from '../../shared/selects/SelectRace';
import SelectRealmType from '../../shared/selects/SelectRealmType';

const gridFormSize = { xs: 12, sm: 12, md: 6, lg: 6, xl: 12 };

const CharacterCreateResume: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  setProfession: Dispatch<SetStateAction<Profession | undefined>>;
  setSelectedRace: Dispatch<SetStateAction<Race | undefined>>;
  selectedRace: Race | undefined;
  races: Race[];
  profession: Profession | undefined;
}> = ({ formData, setFormData, setProfession, setSelectedRace, selectedRace, races, profession }) => {
  const onRaceChange = (race: Race) => {
    if (race) {
      setSelectedRace(race);
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
    if (profession && profession.fixedRealmTypes && profession.fixedRealmTypes.length === 1) {
      realmType = profession.fixedRealmTypes[0];
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

  if (!races) return <p>Loading...</p>;

  return (
    <Grid container spacing={1} mt={5}>
      <Grid size={gridFormSize}>
        <SelectRace label={t('Race')} value={formData.info.raceId} onChange={onRaceChange} races={races} />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectProfession value={formData.info.professionId} onChange={(e, p) => onProfessionChange(e, p)} />
      </Grid>
      <Grid size={gridFormSize}>
        <NameTextField
          label={t('Name')}
          value={formData.name}
          gender={formData.roleplay.gender}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, name: value }))}
          generateRandomRaceValue={selectedRace?.archetype ?? ''}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectRealmType
          profession={profession}
          value={formData.info.realmType}
          onChange={(e) => handleRealmTypeChange(e.target.value)}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('level')}
          name="level"
          value={formData.level}
          onChange={(value) => setFormData((prev) => ({ ...prev, level: value! }))}
          integer
          allowNegatives={false}
          error={!formData.level}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('Height')}
          name="height"
          value={formData.info.height}
          onChange={(value) => setFormData((prev) => ({ ...prev, info: { ...prev.info, height: value! } }))}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('Weight')}
          name="weight"
          value={formData.info.weight}
          onChange={(value) => setFormData((prev) => ({ ...prev, info: { ...prev.info, weight: value! } }))}
          allowNegatives={false}
          error={!formData.info.weight}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <RmuSelect
          value={formData.roleplay.gender}
          label={t('Gender')}
          options={['male', 'female', 'other']}
          onChange={(value: string) =>
            setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, gender: value } }))
          }
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('Age')}
          name="age"
          value={formData.roleplay.age}
          onChange={(value) => setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, age: value! } }))}
          integer
          allowNegatives={false}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterCreateResume;
