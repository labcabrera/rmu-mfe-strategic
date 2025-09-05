/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useError } from '../../../ErrorContext';
import { transferFactionGold } from '../../api/characters';
import GoldTextField from '../../shared/inputs/GoldTextField';

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
        <Grid size={2}>
          <GoldTextField value={goldAmount} i18nLabel="gold-amount" />
        </Grid>
        <Grid size={2}>
          <Stack direction="row" spacing={2}>
            <Button onClick={() => handleTransfer(1)} variant="outlined" startIcon={<ChevronLeftIcon />}>
              +1G
            </Button>
            <Button onClick={() => handleTransfer(10)} variant="outlined" startIcon={<ChevronLeftIcon />}>
              +10G
            </Button>
            <Button onClick={() => handleTransfer(-10)} variant="outlined" endIcon={<ChevronRightIcon />}>
              -10G
            </Button>
            <Button onClick={() => handleTransfer(-1)} variant="outlined" endIcon={<ChevronRightIcon />}>
              -1G
            </Button>
          </Stack>
        </Grid>
        <Grid size={2}>
          <GoldTextField value={faction.factionManagement.availableGold} i18nLabel="faction-gold-amount" />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewAddItem;
