import { Dispatch, SetStateAction } from 'react';
import { CreateCharacterDto, STATS } from '../api/character.dto';
import { StatBonusFormData } from '../characters/create/CharacterCreate';
import { getStatBonus } from './stat-service';

export const randomizeStats = (
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>,
  setStatBonusFormData: Dispatch<SetStateAction<StatBonusFormData>>
) => {
  for (const key of STATS) {
    const values = [randomStatValue(), randomStatValue(), randomStatValue()];
    values.sort((a, b) => b - a);
    const potentialValue = values[0];
    const temporaryValue = values[1];
    const potentialBonus = getStatBonus(potentialValue);
    const temporaryBonus = getStatBonus(temporaryValue);

    setFormData((prevState) => ({
      ...prevState,
      statistics: {
        ...prevState.statistics,
        [key]: {
          ...prevState.statistics[key],
          potential: potentialValue,
          temporary: temporaryValue,
        },
      },
    }));

    setStatBonusFormData((prevState) => ({
      ...prevState,
      [key]: {
        potential: potentialBonus,
        temporary: temporaryBonus,
      },
    }));
  }
};

const randomStatValue = (): number => {
  const min = 11;
  const max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
