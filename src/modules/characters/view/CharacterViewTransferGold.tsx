import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { transferFactionGold } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import NumericCard from '../../shared/cards/NumericCard';

const CharacterViewTransferGold: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
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
      const item = character.items.find((item) => item.itemTypeId === 'gold-coin');
      setGoldAmount(item?.amount || 0);
    }
    fetchFaction(character.faction.id)
      .then((factionData) => setFaction(factionData))
      .catch((err) => showError(err.message));
  }, [character]);

  if (!character || !faction) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center" mt={2}>
      <NumericCard value={goldAmount} subtitle={t('Character')} image={`/static/images/generic/coins.png`} />
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
      <NumericCard
        value={faction.management.availableGold}
        subtitle={t('Faction')}
        image={`/static/images/generic/coins.png`}
      />
    </Stack>
  );
};

export default CharacterViewTransferGold;
