import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Paper, Typography, Button, Stack, Box, Grid, Badge } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { addCharacterXP } from '../../api/character';
import { Character } from '../../api/character.dto';
import NumericCard from '../../shared/cards/NumericCard';
import TextCard from '../../shared/cards/TextCard';
import NumericInput from '../../shared/inputs/NumericInput';

const CharacterViewExperience: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const { showError } = useError();
  const [xpToAdd, setXpToAdd] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  if (!character) return <div>Loading...</div>;

  function handleAdd() {
    if (xpToAdd !== 0) {
      addCharacterXP(character.id, xpToAdd)
        .then((response) => {
          setCharacter(response);
          setXpToAdd(null);
        })
        .catch((err: Error) => showError(err.message));
    }
  }

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('experience')}
      </Typography>
      <Grid container spacing={2} mt={2}>
        <Grid size={12}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.experience.availableLevel}
              subtitle={t('level')}
              image={`/static/images/generic/experience.png`}
              applyColor={false}
            />
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
              invisible={character.experience.availableLevel <= character.experience.level}
            >
              <NumericCard
                value={character.experience.level}
                subtitle={t('current-level')}
                image={`/static/images/generic/experience.png`}
                applyColor={false}
              />
            </Badge>
            <NumericCard
              value={character.experience.xp}
              subtitle={t('xp')}
              image={`/static/images/generic/experience.png`}
              applyColor={false}
              applyFormat={true}
            />
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableDevelopmentPoints}`}
              invisible={character.experience.availableDevelopmentPoints < 1}
            >
              <TextCard
                value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
                subtitle={t('development-points')}
                image={`/static/images/generic/trait-combat.png`}
              />
            </Badge>
          </Box>
        </Grid>
        <Grid size={12}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Box sx={{ width: 160 }}>
              <NumericInput
                value={xpToAdd}
                onChange={(v) => {
                  setXpToAdd(v);
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
