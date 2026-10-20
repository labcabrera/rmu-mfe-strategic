import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Stack, Typography } from '@mui/material';
import {
  Character,
  gridSizeCard,
  NumericInput,
  RmuDialog,
  StatKey,
  updateCharacterTemporaryStat,
  UpdateTemporaryStatDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { getStatGainRoll } from '../../../services/stat-service';

const StatLevelUpDialog: FC<{
  character: Character;
  stat: StatKey | undefined;
  open: boolean;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onClose: () => void;
}> = ({ character, stat, open, setCharacter, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [roll, setRoll] = useState<number>();
  const [minRoll, setMinRoll] = useState<number>();
  const [maxRoll, setMaxRoll] = useState<number>();
  const [diceRoll, setDiceRoll] = useState<string>();
  const selectedStat = stat ? character.statistics[stat] : undefined;
  const potential = selectedStat?.potential;
  const temporary = selectedStat?.temporary;

  const onLevelUp = () => {
    if (!stat || roll === undefined) return;

    const dto = { stat: stat, roll: roll } as UpdateTemporaryStatDto;
    updateCharacterTemporaryStat(character.id, dto, auth)
      .then((response) => {
        setCharacter(response);
        onClose();
      })
      .catch((err) => notify.error(err));
  };

  const calculateDiceRoll = () => {
    if (temporary === undefined) return;

    const die = getStatGainRoll(temporary);
    updateDiceRoll(die.dice, die.min, die.max);
  };

  const updateDiceRoll = (diceRoll?: string, min?: number, max?: number) => {
    setDiceRoll(diceRoll);
    setMinRoll(min);
    setMaxRoll(max);
  };

  useEffect(() => {
    if (stat && selectedStat) {
      calculateDiceRoll();
    } else {
      updateDiceRoll(undefined, undefined, undefined);
    }
  }, [stat, selectedStat]);

  if (!stat || !selectedStat) return null;

  return (
    <RmuDialog
      title={t('stat-level-up-title')}
      open={open}
      onCancel={onClose}
      onConfirm={onLevelUp}
      onConfirmDisabled={roll === undefined}
    >
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{stat}</Typography>
            <Typography color="secondary">{t('stat')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{potential}</Typography>
            <Typography color="secondary">{t('potential')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{temporary}</Typography>
            <Typography color="secondary">{t('temporary')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{diceRoll}</Typography>
            <Typography color="secondary">{t('roll-type')}</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2" color="secondary">
            {t('stat-level-up-help')}
          </Typography>
        </Grid>
        <Grid size={gridSizeCard}>
          <NumericInput
            label={`${t('roll')} ${diceRoll}`}
            value={roll}
            onChange={(v) => setRoll(v || undefined)}
            min={minRoll}
            max={maxRoll}
          />
        </Grid>
      </Grid>
    </RmuDialog>
  );
};

export default StatLevelUpDialog;
