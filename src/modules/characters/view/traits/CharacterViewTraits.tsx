import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import {
  AddButton,
  CategorySeparator,
  Character,
  CharacterTrait,
  gridSizeCard,
  imageBaseUrl,
  LoadingState,
  RmuCard,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import AddTraitDialog from './AddTraitDialog';
import CharacterViewTraitDialog from './CharacterViewTraitDialog';

const CharacterViewTraits: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  const [openAddTraitDialog, setOpenAddTraitDialog] = useState(false);
  const [openTraitDialog, setOpenTraitDialog] = useState(false);
  const [characterTrait, setCharacterTrait] = useState<CharacterTrait>();

  if (!character) return <LoadingState />;

  const handleTraitView = (trait: CharacterTrait) => {
    setCharacterTrait(trait);
    setOpenTraitDialog(true);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CategorySeparator text={t('traits')}>
            <AddButton onClick={() => setOpenAddTraitDialog(true)} />
          </CategorySeparator>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            {character.traits.map((trait, index) => (
              <Grid size={gridSizeCard} key={index}>
                <RmuCard
                  key={index}
                  image={
                    trait.isTalent
                      ? `${imageBaseUrl}images/generic/trait.png`
                      : `${imageBaseUrl}images/generic/disease.png`
                  }
                  onClick={() => handleTraitView(trait)}
                >
                  <Stack direction="column">
                    <Typography>
                      {t(trait.traitId)} {toRoman(trait.tier)}
                    </Typography>
                    <Typography color="secondary">
                      <em>{trait.specialization ? t(trait.specialization) : t('none')}</em>
                    </Typography>
                    {trait.source === 'race' && (
                      <Chip
                        label={t('trait-source-race')}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                      />
                    )}
                  </Stack>
                </RmuCard>
              </Grid>
            ))}
          </Grid>
          {character.traits.length === 0 && <div>{t('character-no-traits')}</div>}
        </Grid>
      </Grid>
      <AddTraitDialog
        character={character}
        setCharacter={setCharacter}
        open={openAddTraitDialog}
        onClose={() => setOpenAddTraitDialog(false)}
      />
      <CharacterViewTraitDialog
        character={character}
        setCharacter={setCharacter}
        characterTrait={characterTrait!}
        open={openTraitDialog}
        onClose={() => setOpenTraitDialog(false)}
      />
    </>
  );
};

export default CharacterViewTraits;
