import { Dispatch, SetStateAction } from 'react';
import { StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/** What every section of the game form receives. */
export interface GameFormSectionProps {
  formData: StrategicGame;
  setFormData: Dispatch<SetStateAction<StrategicGame>>;
}

export const gridSize = { xs: 12, md: 3 };
/** Pickers with a description and switches with a long label. */
export const wideSize = { xs: 12, md: 6 };
