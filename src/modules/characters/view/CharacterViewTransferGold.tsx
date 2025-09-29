import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { transferFactionGold } from '../../api/character';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import GoldTextField from '../../shared/inputs/GoldTextField';

const CharacterViewTransferGold: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  faction: Faction;
}> = ({ character, setCharacter, faction }) => {
  const [goldAmount, setGoldAmount] = useState<number>(0);
  const { showError } = useError();

  const handleTransfer = (amount: number) => {
    transferFactionGold(character.id, amount)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (character) {
      const item = character.items.find((item) => item.itemTypeId === 'gold-coin');
      setGoldAmount(item?.amount || 0);
    }
  }, [character]);

  if (!character || !faction) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('transfer-faction-gold')}
        </Typography>
      </Grid>
      <Grid size={4}>
        <GoldTextField value={goldAmount} i18nLabel="gold-amount" />
      </Grid>
      <Grid size={4}>
        <Stack direction="row" spacing={1}>
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
      <Grid size={4}>
        <GoldTextField value={faction.management.availableGold} i18nLabel="faction-gold-amount" />
      </Grid>
    </Grid>
  );
};

export default CharacterViewTransferGold;
