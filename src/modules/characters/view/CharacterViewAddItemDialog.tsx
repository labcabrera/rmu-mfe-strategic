import React, { useState, useEffect, FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { Character } from '../../api/character.dto';
import { fetchSkills } from '../../api/skill';
import { fetchSkillCategories } from '../../api/skill-category';
import { SkillCategory } from '../../api/skill-category.dto';
import { AddSkill, Skill } from '../../api/skill.dto';
import SelectSkill from '../../shared/selects/SelectSkill';
import SelectSkillCategory from '../../shared/selects/SelectSkillCategory';

const CharacterAddItemDialog: FC<{
  open: boolean;
  character: Character;
  onClose: () => void;
  onSkillAdded: (addSkill: AddSkill) => void;
}> = ({ open, character, onClose, onSkillAdded }) => {
  const { showError } = useError();
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<SkillFormData>(emptyFormData);

  const bindSkills = () => {
    fetchSkills()
      .then((data: Skill[]) => {
        setSkills(data);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  const bindSkillCategories = () => {
    fetchSkillCategories()
      .then((data: SkillCategory[]) => {
        setSkillCategories(data);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    bindSkills();
    bindSkillCategories();
  }, []);

  const handleSkillChange = (skill: Skill) => {
    setFormData({ ...formData, skillId: skill.id });
  };

  const handleSave = async () => {
    if (!formData.skillId) {
      showError('Please select a skill');
      return;
    }
    try {
      const skill = {
        skillId: formData.skillId,
        specialization: null,
        ranks: 0,
      } as AddSkill;
      onSkillAdded(skill);
      handleClose();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleClose = () => {
    setFormData(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <SelectSkillCategory
              label={t('category')}
              categories={skillCategories}
              value={formData.categoryId}
              onChange={(category) => setFormData({ ...formData, categoryId: category.id, skillId: null })}
            />
          </Grid>
          <Grid size={12}>
            <SelectSkill label={t('skill')} skills={skills} value={formData.skillId} onChange={handleSkillChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!formData.skillId}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface SkillFormData {
  categoryId: string | null;
  skillId: string | null;
}

const emptyFormData: SkillFormData = {
  categoryId: null,
  skillId: null,
};

export default CharacterAddItemDialog;
