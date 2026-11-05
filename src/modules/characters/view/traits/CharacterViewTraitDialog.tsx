import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Chip, Typography } from '@mui/material';
import {
  Character,
  CharacterTrait,
  deleteCharacterTrait,
  DeleteTraitDto,
  fetchTrait,
  KeyValueList,
  KeyValueRow,
  RmuDialog,
  TechnicalInfo,
  Trait,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { toRoman } from '../../../services/roman-number-service';

const CharacterViewTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  characterTrait: CharacterTrait;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, characterTrait, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [trait, setTrait] = useState<Trait | null>(null);

  const onDeleteTrait = () => {
    const dto: DeleteTraitDto = {
      traitId: characterTrait.traitId,
      specialization: characterTrait.specialization,
    };
    deleteCharacterTrait(character.id, dto, auth)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        onClose();
      })
      .catch((error) => notify.error(error));
  };

  useEffect(() => {
    if (characterTrait) {
      fetchTrait(characterTrait.traitId, auth)
        .then((data) => setTrait(data))
        .catch((error) => notify.error(error));
    }
  }, [characterTrait]);

  if (!trait) return null;

  // Spec 077: how each tier was acquired, the talent a flaw is linked to and the restriction
  const purchaseRows: KeyValueRow[] = [
    ...(characterTrait.acquiredBy ?? []).map((entry) => ({
      label: t('trait-tier-label', { tier: toRoman(entry.tier) }),
      value: [t(`trait-prerequisite-${entry.type}`), entry.value ? t(entry.value, { defaultValue: entry.value }) : '']
        .filter(Boolean)
        .join(': '),
      hint: entry.note,
    })),
    ...(characterTrait.linkedTo
      ? [
          {
            label: t('trait-link'),
            value: t(characterTrait.linkedTo.traitId, {
              defaultValue:
                character.traits.find((owned) => owned.traitId === characterTrait.linkedTo?.traitId)?.traitName ??
                characterTrait.linkedTo.traitId,
            }),
          },
        ]
      : []),
    ...(characterTrait.restricted
      ? [{ label: t('trait-restricted'), value: characterTrait.restricted.note || t('yes') }]
      : []),
  ];

  return (
    <RmuDialog
      open={open}
      title={t(trait.name)}
      maxWidth="sm"
      onDelete={characterTrait.source !== 'race' ? onDeleteTrait : undefined}
      onClose={onClose}
    >
      {characterTrait.source === 'race' && (
        <Chip label={t('trait-source-race')} size="small" color="primary" variant="outlined" />
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} gutterBottom>
        {trait.description}
      </Typography>
      {characterTrait.pendingApproval && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t('trait-pending-approval-help')}
        </Alert>
      )}
      {purchaseRows.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <KeyValueList dense rows={purchaseRows} />
        </Box>
      )}
      <TechnicalInfo>
        <pre>{`CharacterTrait: ${JSON.stringify(characterTrait, null, 2)}`}</pre>
        <pre>{`Trait: ${JSON.stringify(trait, null, 2)}`}</pre>
      </TechnicalInfo>
    </RmuDialog>
  );
};

export default CharacterViewTraitDialog;
