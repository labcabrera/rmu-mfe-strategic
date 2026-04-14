import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Button, Stack, Box, Grid, Badge } from '@mui/material';
import {
  CategorySeparator,
  RmuTextCard,
  NumericInput,
  addCharacterXP,
  Character,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';

const grayscale = 0.7;
const gridSizeCard = { xs: 10, sm: 5, md: 5, lg: 3, xl: 2 } as const;

const CharacterViewExperience: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const { showError } = useError();
  const [xpToAdd, setXpToAdd] = useState<number>();
  const [error, setError] = useState<boolean>(false);

  if (!character) return <div>Loading...</div>;

  function handleAdd() {
    if (xpToAdd && xpToAdd !== 0) {
      addCharacterXP(character.id, xpToAdd)
        .then((response) => {
          setCharacter(response);
          setXpToAdd(undefined);
        })
        .catch((err) => showError(err.message));
    }
  }

  return (
    <>
      <CategorySeparator text={t('Experience')} />
      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.experience.availableLevel}
            subtitle={t('Level')}
            image={`${imageBaseUrl}images/generic/experience.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
            invisible={character.experience.availableLevel <= character.experience.level}
            sx={{ display: 'block' }}
          >
            <RmuTextCard
              value={character.experience.level}
              subtitle={t('Current level')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={new Intl.NumberFormat('en-US').format(character.experience.xp)}
            subtitle={t('XP')}
            image={`${imageBaseUrl}images/generic/experience.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableDevPoints}`}
            invisible={character.experience.availableDevPoints < 1}
            sx={{ display: 'block' }}
          >
            <RmuTextCard
              value={`${character.experience.availableDevPoints} / ${character.experience.devPoints}`}
              subtitle={t('Development points')}
              image={`${imageBaseUrl}images/generic/trait-combat.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Box sx={{ width: 160 }}>
            <NumericInput
              value={xpToAdd || null}
              onChange={(v) => {
                setXpToAdd(v!);
                if (v && v > 0) setError(false);
              }}
              integer
              label={t('Add XP')}
              error={error}
            />
          </Box>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            {t('Add')}
          </Button>
        </Stack>
      </Grid>
    </>
  );
};

export default CharacterViewExperience;
