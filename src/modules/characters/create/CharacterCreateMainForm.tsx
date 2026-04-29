import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Paper } from '@mui/material';
import {
  CategorySeparator,
  CreateCharacterDto,
  NumericInput,
  Profession,
  Race,
  RmuSelect,
  STATISTICS,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import NameTextField from '../../shared/inputs/NameTextField';
import SelectProfession from '../../shared/selects/SelectProfession';
import SelectRace from '../../shared/selects/SelectRace';
import SelectRealmType from '../../shared/selects/SelectRealmType';

const gridFormSize = { xs: 12, sm: 12, md: 6, lg: 6, xl: 4 };

const CharacterCreateMainForm: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  setProfession: Dispatch<SetStateAction<Profession | undefined>>;
  setSelectedRace: Dispatch<SetStateAction<Race | undefined>>;
  selectedRace: Race | undefined;
  races: Race[];
  profession: Profession | undefined;
}> = ({ formData, setFormData, setProfession, setSelectedRace, selectedRace, races, profession }) => {
  const { t } = useTranslation();

  const onRaceChange = (race: Race) => {
    if (race) {
      setSelectedRace(race);
      const stats = { ...formData.statistics };
      STATISTICS.forEach((key) => {
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
    <Grid container spacing={2}>
      <Grid size={12}>
        <CategorySeparator text={t('information')} />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectRace label={t('race')} value={formData.info.raceId} onChange={onRaceChange} races={races} />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectProfession value={formData.info.professionId} onChange={(e, p) => onProfessionChange(e, p)} />
      </Grid>
      <Grid size={gridFormSize}>
        <NameTextField
          label={t('name')}
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
          label={t('height')}
          name="height"
          value={formData.info.height}
          onChange={(value) => setFormData((prev) => ({ ...prev, info: { ...prev.info, height: value! } }))}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('weight')}
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
          label={t('gender')}
          options={['male', 'female', 'other']}
          onChange={(value: string) =>
            setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, gender: value } }))
          }
        />
      </Grid>
      <Grid size={gridFormSize}>
        <NumericInput
          label={t('age')}
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

export default CharacterCreateMainForm;
