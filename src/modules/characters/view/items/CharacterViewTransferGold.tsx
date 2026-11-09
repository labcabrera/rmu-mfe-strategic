import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Stack, Typography } from '@mui/material';
import {
  Character,
  MoneyDisplay,
  NumericInput,
  Panel,
  transferFactionGold,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { HolderView } from '../../../economy/use-holder';

/**
 * Gold between a character and its faction (spec 023): any amount, in gold pieces with decimals for the smaller
 * coins. Giving gold of the faction to a character needs the game master.
 */
export default function CharacterViewTransferGold({
  character,
  view,
  onChanged,
}: {
  character: Character;
  view: HolderView;
  onChanged: (character?: Character) => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const [amount, setAmount] = useState<number | null>(1);
  const factionGold = view.faction?.management.availableGold ?? 0;
  const characterGold = view.gold;

  const handleTransfer = (gold: number) => {
    transferFactionGold(character.id, gold, auth)
      .then((data) => onChanged(data))
      .catch((err) => notify.error(err));
  };

  if (!view.faction) return null;

  return (
    <Panel variant="outlined" title={t('transfer-gold')} sx={{ mt: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack>
          <Typography variant="caption" color="text.secondary">
            {character.name}
          </Typography>
          <MoneyDisplay gold={characterGold} showIcon />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            onClick={() => handleTransfer(amount ?? 0)}
            variant="outlined"
            startIcon={<ChevronLeftIcon />}
            disabled={!amount || factionGold < amount}
            aria-label={t('transfer-gold-to-character')}
          >
            {t('receive')}
          </Button>
          <Box sx={{ width: 120 }}>
            <NumericInput label={t('gold')} value={amount} onChange={setAmount} min={0} maxFractionDigits={3} />
          </Box>
          <Button
            onClick={() => handleTransfer(-(amount ?? 0))}
            variant="outlined"
            endIcon={<ChevronRightIcon />}
            disabled={!amount || characterGold < amount}
            aria-label={t('transfer-gold-to-faction')}
          >
            {t('give')}
          </Button>
        </Stack>
        <Stack sx={{ alignItems: { sm: 'flex-end' } }}>
          <Typography variant="caption" color="text.secondary">
            {view.faction.name}
          </Typography>
          <MoneyDisplay gold={factionGold} showIcon />
        </Stack>
      </Stack>
    </Panel>
  );
}
