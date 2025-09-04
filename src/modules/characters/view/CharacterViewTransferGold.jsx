/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useError } from '../../../ErrorContext';
import { transferFactionGold } from '../../api/characters';

const CharacterViewAddItem = ({ character, setCharacter, faction }) => {
  const { t } = useTranslation();
  const [goldAmount, setGoldAmount] = useState(0);
  const { showError } = useError();

  const handleTransfer = (amount) => {
    transferFactionGold(character.id, amount)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  useEffect(() => {
    if (character) {
      const item = character.items.find((item) => item.itemTypeId === 'gold-coin');
      setGoldAmount(item.amount || 0);
    }
  }, [character]);

  if (!character || !faction) {
    return null;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('transfer-faction-gold')}
          </Typography>
        </Grid>
        <Grid size={4}>
          <TextField label={t('gold-amount')} value={goldAmount} variant="standard" fullWidth readOnly />
        </Grid>
        <Grid size={4}>
          <TextField label={t('faction-gold-amount')} value={faction.factionManagement.availableGold} variant="standard" fullWidth readOnly />
        </Grid>
        <Grid size={4}>
          <Button onClick={() => handleTransfer(1)}>+1G</Button>
          <Button onClick={() => handleTransfer(10)}>+10G</Button>
          <Button onClick={() => handleTransfer(-10)}>-10G</Button>
          <Button onClick={() => handleTransfer(-1)}>-1G</Button>
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewAddItem;
