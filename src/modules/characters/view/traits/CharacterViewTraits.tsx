import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  AddButton,
  Character,
  CharacterTrait,
  LoadingState,
  Panel,
  StrategicGame,
  TraitTypeChip,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import AddTraitDialog from './AddTraitDialog';
import CharacterViewTraitDialog from './CharacterViewTraitDialog';

/** Traits of the character: name and tier, specialization, type, source and the development points paid. */
const CharacterViewTraits: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => {
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
      <Panel title={t('traits')} extra={<AddButton onClick={() => setOpenAddTraitDialog(true)} />}>
        {character.traits.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('character-no-traits')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {character.traits.map((trait, index) => (
              <ListItemButton
                key={`${trait.traitId}-${trait.specialization ?? ''}-${trait.source ?? ''}-${index}`}
                onClick={() => handleTraitView(trait)}
                divider={index < character.traits.length - 1}
                sx={{ gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' }, px: 1 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {t(trait.traitId, { defaultValue: trait.traitName })} {toRoman(trait.tier)}
                  </Typography>
                  {trait.specialization && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {t(trait.specialization)}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flex: 'none' }}>
                  {trait.source === 'race' && (
                    <Chip label={t('trait-source-race')} size="small" color="primary" variant="outlined" />
                  )}
                  <TraitTypeChip isTalent={trait.isTalent} />
                  {trait.source !== 'race' && <TraitPaidChip trait={trait} />}
                </Stack>
              </ListItemButton>
            ))}
          </List>
        )}
      </Panel>
      <AddTraitDialog
        character={character}
        setCharacter={setCharacter}
        strategicGame={strategicGame}
        open={openAddTraitDialog}
        onClose={() => setOpenAddTraitDialog(false)}
      />
      {characterTrait && (
        <CharacterViewTraitDialog
          character={character}
          setCharacter={setCharacter}
          characterTrait={characterTrait}
          open={openTraitDialog}
          onClose={() => setOpenTraitDialog(false)}
        />
      )}
    </>
  );
};

/** Development points the trait cost (returned ones for flaws), with the pools in a tooltip when they are known. */
const TraitPaidChip: FC<{ trait: CharacterTrait }> = ({ trait }) => {
  const { t } = useTranslation();
  const cost = trait.cost || 0;
  const label = cost < 0 ? t('trait-dp-returned', { dp: -cost }) : t('trait-dp-paid', { dp: cost });
  const paid = trait.paidWith;
  const breakdown = paid
    ? (['normal', 'bonus', 'flaw'] as const)
        .filter((pool) => paid[pool] !== 0)
        .map((pool) => `${t(`trait-pool-${pool}`)}: ${Math.abs(paid[pool])}`)
        .join(' · ')
    : '';
  const chip = <Chip size="small" variant="outlined" label={label} />;
  return breakdown ? <Tooltip title={breakdown}>{chip}</Tooltip> : chip;
};

export default CharacterViewTraits;
