import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import {
  CreateCharacterDto,
  LoadingState,
  NumericInput,
  Profession,
  Race,
  STATS,
  useNotify,
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
  selectedRace?: Race;
  races: Race[];
  profession: Profession | undefined;
}> = ({ formData, setFormData, setProfession, setSelectedRace, selectedRace, races, profession }) => {
  const { t } = useTranslation();
  const notify = useNotify();

  const onRaceChange = (race: Race) => {
    if (!race) return;
    setSelectedRace(race);
    const stats = { ...formData.statistics };
    STATS.forEach((key) => {
      stats[key] = { ...stats[key], racial: race.stats[key] };
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
  };

  const onProfessionChange = (professionId: string, profession: Profession) => {
    // The fixed realms of a spellcaster (two for a hybrid), or the realm chosen if the new profession allows it
    const current = formData.info.realmTypes ?? [];
    const fixed: string[] = profession?.fixedRealmTypes ?? [];
    const available: string[] = profession?.availableRealmTypes ?? [];
    const realmTypes =
      fixed.length > 0 ? fixed : current.length === 1 && (available.length === 0 || available.includes(current[0])) ? current : [];
    setFormData((prevState) => ({
      ...prevState,
      info: {
        ...prevState.info,
        professionId: professionId,
        realmTypes,
      },
    }));
    setProfession(profession);
  };

  const handleRealmTypeChange = (realmTypes: string[]) => {
    setFormData((prevState) => ({
      ...prevState,
      info: { ...prevState.info, realmTypes },
    }));
  };

  if (!races) return <LoadingState />;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <NameTextField
          label={t('name')}
          value={formData.name}
          gender={formData.roleplay.gender}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, name: value }))}
          generateRandomRaceValue={selectedRace?.archetype ?? ''}
          onError={(e) => notify.error(e)}
        />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectRace label={t('race')} value={formData.info.raceId} onChange={onRaceChange} races={races} />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectProfession value={formData.info.professionId} onChange={(e, p) => onProfessionChange(e, p!)} />
      </Grid>
      <Grid size={gridFormSize}>
        <SelectRealmType profession={profession} value={formData.info.realmTypes ?? []} onChange={handleRealmTypeChange} />
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
    </Grid>
  );
};

export default CharacterCreateMainForm;
