import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Stack, Typography } from '@mui/material';
import {
  Character,
  StrategicItem,
  Faction,
  transferFactionGold,
  fetchFaction,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';

const goldCoin = 'gold-coin';

const CharacterViewTransferGold: FC<{
  character: Character;
  items: StrategicItem[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, items, setCharacter }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [goldAmount, setGoldAmount] = useState<number>(0);
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();

  const characterAmount: number =
    items
      .filter((item) => item.itemTypeId === goldCoin)
      .map((e) => e.amount)
      .reduce((a, b) => a + b, 0) || 0;

  const handleTransfer = (amount: number) => {
    transferFactionGold(character.id, amount, auth)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (character) {
      const item = items.find((item) => item.itemTypeId === goldCoin);
      setGoldAmount(item?.amount || 0);
    }
    fetchFaction(character.faction.id, auth)
      .then((factionData) => setFaction(factionData))
      .catch((err) => showError(err.message));
  }, [character, items]);

  if (!character || !faction) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2 }}>
      <Typography>
        {t('character')} ({characterAmount})
      </Typography>
      <Button
        onClick={() => handleTransfer(1)}
        variant="outlined"
        startIcon={<ChevronLeftIcon />}
        disabled={faction.management.availableGold < 1}
      >
        1G
      </Button>
      <Button
        onClick={() => handleTransfer(10)}
        variant="outlined"
        startIcon={<ChevronLeftIcon />}
        disabled={faction.management.availableGold < 10}
      >
        10G
      </Button>
      <Button
        onClick={() => handleTransfer(-10)}
        variant="outlined"
        endIcon={<ChevronRightIcon />}
        disabled={characterAmount < 10}
      >
        10G
      </Button>
      <Button
        onClick={() => handleTransfer(-1)}
        variant="outlined"
        endIcon={<ChevronRightIcon />}
        disabled={characterAmount < 1}
      >
        1G
      </Button>
      <Typography>
        {t('faction')} ({faction.management.availableGold})
      </Typography>
    </Stack>
  );
};

export default CharacterViewTransferGold;
