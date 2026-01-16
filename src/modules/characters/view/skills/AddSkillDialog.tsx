import React, { useState, useEffect, FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { Character } from '../../../api/character.dto';
import { fetchSkills } from '../../../api/skill';
import { fetchSkillCategories } from '../../../api/skill-category';
import { SkillCategory } from '../../../api/skill-category.dto';
import { AddSkill, Skill } from '../../../api/skill.dto';

const AddSkillDialog: FC<{
  open: boolean;
  character: Character;
  onClose: () => void;
  onSkillAdded: (addSkill: AddSkill) => void;
}> = ({ open, character, onClose, onSkillAdded }) => {
  const { showError } = useError();
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<SkillFormData>(emptyFormData);

  const bindSkillCategories = () => {
    fetchSkillCategories()
      .then((data: SkillCategory[]) => setSkillCategories(data))
      .catch((error) => showError(error.message));
  };

  const handleSkillCategoryChange = (_event: React.MouseEvent<HTMLElement>, newCategoryId: string | null) => {
    if (newCategoryId) {
      setFormData({ ...formData, categoryId: newCategoryId, skillId: null });
      fetchSkills(newCategoryId)
        .then((data: Skill[]) => setSkills(data))
        .catch((error) => showError(error.message));
    } else {
      setFormData({ ...formData, categoryId: null, skillId: null });
      setSkills([]);
    }
  };

  const handleSkillChange = (_event: React.MouseEvent<HTMLElement>, newSkillId: string | null) => {
    if (newSkillId) {
      setFormData({ ...formData, skillId: newSkillId });
    } else {
      setFormData({ ...formData, skillId: null });
    }
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

  useEffect(() => {
    bindSkillCategories();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={5}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('category')}
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <ToggleButtonGroup
                orientation="vertical"
                value={formData.categoryId}
                exclusive
                onChange={handleSkillCategoryChange}
                fullWidth
                size="small"
                aria-label="skill-categories"
              >
                {skillCategories.map((c) => (
                  <ToggleButton key={c.id} value={c.id} aria-label={c.id} sx={{ justifyContent: 'flex-start' }}>
                    {t(c.id)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Grid>
          <Grid size={7}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('skill')}
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <ToggleButtonGroup
                orientation="vertical"
                value={formData.skillId}
                exclusive
                onChange={handleSkillChange}
                fullWidth
                size="small"
                aria-label="skills"
              >
                {skills.map((s) => (
                  <ToggleButton key={s.id} value={s.id} aria-label={s.id} sx={{ justifyContent: 'flex-start' }}>
                    {t(s.id)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
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

export default AddSkillDialog;
