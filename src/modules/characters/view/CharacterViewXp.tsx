import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Button, Stack, Box, Grid, Badge } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { addCharacterXP } from '../../api/character';
import { Character } from '../../api/character.dto';
import { imageBaseUrl } from '../../services/config';
import NumericCard from '../../shared/cards/NumericCard';
import RmuTextCard from '../../shared/cards/RmuTextCard';
import CategorySeparator from '../../shared/display/CategorySeparator';
import NumericInput from '../../shared/inputs/NumericInput';

const CharacterViewExperience: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
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
      <Grid container spacing={2} mt={2}>
        <Grid size={12}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.experience.availableLevel}
              subtitle={t('Level')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              applyColor={false}
            />
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
              invisible={character.experience.availableLevel <= character.experience.level}
            >
              <NumericCard
                value={character.experience.level}
                subtitle={t('Current level')}
                image={`${imageBaseUrl}images/generic/experience.png`}
                applyColor={false}
              />
            </Badge>
            <NumericCard
              value={character.experience.xp}
              subtitle={t('XP')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              applyColor={false}
              applyFormat={true}
            />
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableDevelopmentPoints}`}
              invisible={character.experience.availableDevelopmentPoints < 1}
            >
              <RmuTextCard
                value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
                subtitle={t('Development points')}
                image={`${imageBaseUrl}images/generic/trait-combat.png`}
              />
            </Badge>
          </Box>
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
      </Grid>
    </>
  );
};

export default CharacterViewExperience;
