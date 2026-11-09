import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SavingsIcon from '@mui/icons-material/Savings';
import { Button, ButtonProps } from '@mui/material';
import { ItemHolder, MagicItemDialog, TreasureDialog } from '@labcabrera-rmu/rmu-react-shared-lib';

type Props = {
  holder: ItemHolder;
  gameId: string;
  /** Gold or items of the holder changed: reload them. */
  onChanged: () => void;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

/**
 * Random treasure for a faction or a character (workspace spec 067, decision 17): the game master rolls it and awards
 * the chosen lines to this holder.
 */
export const HolderTreasureButton: FC<Props> = ({ holder, gameId, onChanged, variant, size }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} startIcon={<SavingsIcon />} onClick={() => setOpen(true)}>
        {t('treasure')}
      </Button>
      <TreasureDialog
        open={open}
        onClose={() => setOpen(false)}
        gameId={gameId}
        holder={holder}
        onAwarded={onChanged}
      />
    </>
  );
};

/** A magic item for the holder (spec 067, decision 7): a gift, or paid by the holder. */
export const CreateMagicItemButton: FC<Props> = ({ holder, gameId, onChanged, variant, size }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} startIcon={<AutoFixHighIcon />} onClick={() => setOpen(true)}>
        {t('magic-item-create')}
      </Button>
      <MagicItemDialog
        open={open}
        onClose={() => setOpen(false)}
        gameId={gameId}
        holder={holder}
        onCreated={onChanged}
        allowPayment
      />
    </>
  );
};
