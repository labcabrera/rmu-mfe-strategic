import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import {
  addCharacterSkill,
  AddSkill,
  Character,
  fetchSkill,
  Skill,
  SkillSelector,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';

const AddSkillDialog: FC<{
  open: boolean;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onClose: () => void;
}> = ({ open, character, setCharacter, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
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
      .catch((err) => showError(err.message));
  };

  const onAddSkill = async () => {
    addCharacterSkill(character.id, formData!, auth)
      .then((response) => {
        setCharacter(response);
        reset();
      })
      .catch((err) => showError(err.message));
  };

  const isValid = (): boolean => {
    if (!selectedSkill) return false;
    if (!formData.skillId) return false;
    if (!formData.specialization && selectedSkill.specialization) return false;
    return true;
  };

  const reset = () => {
    setFormData({ ranks: 0 } as AddSkill);
  };

  useEffect(() => {
    setValidFormData(isValid());
  }, [formData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={12}>
            <SkillSelector
              onSkillChange={(v) => onSelectedSkill(v || '')}
              onSpecializationChange={(v) => setFormData({ ...formData, specialization: v })}
              onError={(err) => showError(err)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={onAddSkill} variant="contained" disabled={!validFormData}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSkillDialog;
