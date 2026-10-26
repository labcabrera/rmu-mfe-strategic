import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Grid } from '@mui/material';
import {
  addCharacterSkill,
  AddSkill,
  Character,
  fetchSkill,
  RmuDialog,
  Skill,
  SkillSelector,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export default function AddSkillDialog({
  open,
  character,
  setCharacter,
  onClose,
}: {
  open: boolean;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onClose: () => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [formData, setFormData] = useState<AddSkill>({ ranks: 0 } as AddSkill);
  const [validFormData, setValidFormData] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSelectedSkill = (skillId: string) => {
    if (!skillId) return;
    fetchSkill(skillId, auth)
      .then((response) => {
        setSelectedSkill(response);
        setFormData({ ...formData, skillId });
      })
      .catch((err) => notify.error(err));
  };

  const onAddSkill = async () => {
    addCharacterSkill(character.id, formData!, auth)
      .then((response) => {
        setCharacter(response);
        reset();
      })
      .catch((err) => notify.error(err));
  };

  const isValid = (): boolean => {
    if (!selectedSkill) return false;
    if (!formData.skillId) return false;
    if (!formData.specialization && selectedSkill.specialization && !selectedSkill.specializationOptional) return false;
    return true;
  };

  const reset = () => {
    setFormData({ ranks: 0 } as AddSkill);
  };

  useEffect(() => {
    setValidFormData(isValid());
  }, [formData]);

  return (
    <RmuDialog
      title={t('add-skill')}
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      buttons={
        <Button onClick={onAddSkill} variant="contained" disabled={!validFormData}>
          {t('add')}
        </Button>
      }
    >
      <Grid container spacing={1}>
        <Grid size={12}>
          <SkillSelector
            realms={character.info.realmTypes ?? [character.info.realmType]}
            onSkillChange={(v) => onSelectedSkill(v || '')}
            onSpecializationChange={(v) => setFormData({ ...formData, specialization: v })}
            onError={(err) => notify.error(err)}
          />
        </Grid>
      </Grid>
    </RmuDialog>
  );
}
