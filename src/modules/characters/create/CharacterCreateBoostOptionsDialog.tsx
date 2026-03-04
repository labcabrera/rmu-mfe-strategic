import React, { FC, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { t } from 'i18next';
import { CreateCharacterDto, STATS } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getStatBonus } from '../../services/stat-service';
import { StatBonus } from './CharacterCreate';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';

const CharacterCreateBoostOptionsDialog: FC<{
  open: boolean;
  onClose: () => void;
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateCharacterDto>>;
}> = ({ open, onClose, strategicGame, formData, setFormData }) => {
  const [statBonusFormData, setStatBonusFormData] = useState<{ [key: string]: StatBonus }>({} as any);
  const [boosts, setBoosts] = useState<number>(strategicGame?.powerLevel.statCreationBoost || 0);
  const [swaps, setSwaps] = useState<number>(strategicGame?.powerLevel.statCreationSwap || 0);

  useEffect(() => {
    const initial: { [key: string]: StatBonus } = {} as any;
    STATS.forEach((s) => {
      const stat = formData.statistics?.[s];
      const potential = stat?.potential ?? 0;
      const temporary = stat?.temporary ?? 0;
      initial[s] = { potential: getStatBonus(potential), temporary: getStatBonus(temporary) } as StatBonus;
    });
    setStatBonusFormData(initial);
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      setBoosts(strategicGame.powerLevel.statCreationBoost);
      setSwaps(strategicGame.powerLevel.statCreationSwap);
    }
  }, [strategicGame]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle color="primary">{t('statistics-boosts')}</DialogTitle>
      <DialogContent>
        <CharacterCreateStatsActions
          strategicGame={strategicGame}
          formData={formData}
          setFormData={setFormData}
          setStatBonusFormData={setStatBonusFormData}
          boosts={boosts}
          setBoosts={setBoosts}
          swaps={swaps}
          setSwaps={setSwaps}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterCreateBoostOptionsDialog;
