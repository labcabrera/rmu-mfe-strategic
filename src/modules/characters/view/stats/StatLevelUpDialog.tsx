import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Stack, Typography } from '@mui/material';
import {
  Character,
  NumericInput,
  RmuDialog,
  StatKey,
  updateCharacterTemporaryStat,
  UpdateTemporaryStatDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { gridSizeCard } from '../../../services/display';

const StatLevelUpDialog: FC<{
  character: Character;
  stat: StatKey | undefined;
  open: boolean;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onClose: () => void;
}> = ({ character, stat, open, setCharacter, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();

  if (!character || !stat) return <div>Loading...</div>;

  const { showError } = useError();
  const [roll, setRoll] = useState<number>();
  const [minRoll, setMinRoll] = useState<number>();
  const [maxRoll, setMaxRoll] = useState<number>();
  const [diceRoll, setDiceRoll] = useState<string>();
  const potential = character.statistics[stat].potential;
  const temporary = character.statistics[stat].temporary;

  const onLevelUp = () => {
    const dto = { stat: stat, roll: roll } as UpdateTemporaryStatDto;
    updateCharacterTemporaryStat(character.id, dto, auth)
      .then((response) => {
        setCharacter(response);
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  const calculateDiceRoll = () => {
    if (temporary < 7) updateDiceRoll('d3 - 1', 0, 2);
    else if (temporary < 9) updateDiceRoll('d3', 1, 3);
    else if (temporary < 19) updateDiceRoll('d6', 1, 6);
    else if (temporary < 82) updateDiceRoll('d10', 1, 10);
    else if (temporary < 91) updateDiceRoll('d6', 1, 6);
    else if (temporary < 93) updateDiceRoll('d3', 1, 3);
    else updateDiceRoll('d3 - 1', 0, 2);
  };

  const updateDiceRoll = (diceRoll: string, min: number, max: number) => {
    setDiceRoll(diceRoll);
    setMinRoll(min);
    setMaxRoll(max);
  };

  useEffect(() => {
    if (stat && character) {
      calculateDiceRoll();
    }
  }, [stat, character]);

  return (
    <RmuDialog
      title={`Level up temporary stat`}
      open={open}
      onCancel={onClose}
      onConfirm={onLevelUp}
      onConfirmDisabled={!roll}
    >
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{stat}</Typography>
            <Typography color="secondary">{t('Stat')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{potential}</Typography>
            <Typography color="secondary">{t('Potential')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{temporary}</Typography>
            <Typography color="secondary">{t('Temporary')}</Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography>{diceRoll}</Typography>
            <Typography color="secondary">{t('Roll type')}</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2" color="secondary">
            Every time a character goes up a level, or for level 2 and above when creating a character beyond 1st level,
            pick two stats to get a stat gain roll (or one stat to get two rolls). Stats cannot be raised above their
            spent (e.g., a human who spends nothing on talents potential value. Stat gains may also be purchased with
            Development Points. For 4 DP, a character can make one additional Stat Gain roll.
          </Typography>
        </Grid>
        <Grid size={gridSizeCard}>
          <NumericInput
            label={`${t('Roll')} ${diceRoll}`}
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
