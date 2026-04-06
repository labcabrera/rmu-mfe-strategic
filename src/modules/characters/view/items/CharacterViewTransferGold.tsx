import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Stack, Typography } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { transferFactionGold } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { fetchFaction } from '../../../api/faction';
import { Faction } from '../../../api/faction.dto';
import { StrategicItem } from '../../../api/strategic-item.dto';
import { imageBaseUrl } from '../../../services/config';

const goldCoin = 'gold-coin';

const CharacterViewTransferGold: FC<{
  character: Character;
  items: StrategicItem[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, items, setCharacter }) => {
  const [goldAmount, setGoldAmount] = useState<number>(0);
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();

  const handleTransfer = (amount: number) => {
    transferFactionGold(character.id, amount)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (character) {
      const item = items.find((item) => item.itemTypeId === goldCoin);
      setGoldAmount(item?.amount || 0);
    }
    fetchFaction(character.faction.id)
      .then((factionData) => setFaction(factionData))
      .catch((err) => showError(err.message));
  }, [character]);

  if (!character || !faction) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center" mt={2}>
      <Stack direction="column">
        <Typography>{goldAmount}</Typography>
        <Typography variant="body2" color="secondary">
          Character
        </Typography>
      </Stack>
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
      <Stack direction="column">
        <Typography>{faction.management.availableGold}</Typography>
        <Typography variant="body2" color="secondary">
          Faction
        </Typography>
      </Stack>
    </Stack>
  );
};

export default CharacterViewTransferGold;
