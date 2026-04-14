import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import {
  addCharacterSkill,
  AddSkill,
  Character,
  fetchSkill,
  Skill,
  SkillSelector,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';

const AddSkillDialog: FC<{
  open: boolean;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onClose: () => void;
}> = ({ open, character, setCharacter, onClose }) => {
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
    fetchSkill(skillId)
      .then((response) => {
        setSelectedSkill(response);
        setFormData({ ...formData, skillId });
      })
      .catch((err) => showError(err.message));
  };

  const onAddSkill = async () => {
    addCharacterSkill(character.id, formData!)
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
      <DialogTitle>{t('Add skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={12}>
            <SkillSelector
              onSkillChange={(v) => onSelectedSkill(v || '')}
              onSpecializationChange={(v) => setFormData({ ...formData, specialization: v })}
              onError={(err) => showError(err)}
              t={(msg) => t(msg)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Cancel')}</Button>
        <Button onClick={onAddSkill} variant="contained" disabled={!validFormData}>
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSkillDialog;
