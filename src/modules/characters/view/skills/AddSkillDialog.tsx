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
import AddSkillSpecialization from './AddSkillSpecialization';

const AddSkillDialog: FC<{
  open: boolean;
  character: Character;
  onClose: () => void;
  onSkillAdded: (addSkill: AddSkill) => void;
}> = ({ open, character, onClose, onSkillAdded }) => {
  const { showError } = useError();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<SkillCategory[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);

  const bindSkillCategories = () => {
    fetchSkillCategories()
      .then((data) => setSkillCategories(data))
      .catch((error) => showError(error.message));
  };

  const bindSkills = () => {
    fetchSkills()
      .then((data) => setSkills(data))
      .catch((error) => showError(error.message));
  };

  const hasSkill = (skill: Skill): boolean => {
    if (skill.specialization) {
      return false;
    }
    return character.skills?.some((s) => s.skillId === skill.id) ?? false;
  };

  //TODO check if skill had specialization
  const filterSkills = () => {
    const notSelectedSkills = skills.filter((s) => !hasSkill(s));
    setFilteredCategories(skillCategories.filter((c) => notSelectedSkills.some((s) => s.categoryId === c.id)));
    setFilteredSkills(
      notSelectedSkills.filter((s) => (selectedCategoryId ? s.categoryId === selectedCategoryId : true))
    );
  };

  const onAddSkill = async () => {
    if (!selectedSkill) {
      showError('Please select a skill');
      return;
    }
    try {
      const skill = {
        skillId: selectedSkill.id,
        specialization: selectedSpecialization,
        ranks: 0,
      } as AddSkill;
      onSkillAdded(skill);
      handleClose();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleClose = () => {
    setSelectedSkill(null);
    setSelectedSpecialization(null);
    onClose();
  };

  useEffect(() => {
    filterSkills();
  }, [character, selectedCategoryId, skills]);

  useEffect(() => {
    bindSkillCategories();
    bindSkills();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={4}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('category')}
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <ToggleButtonGroup
                orientation="vertical"
                value={selectedCategoryId}
                exclusive
                onChange={(_event, newCategoryId) => setSelectedCategoryId(newCategoryId)}
                fullWidth
                size="small"
                aria-label="skill-categories"
              >
                {filteredCategories.map((c) => (
                  <ToggleButton key={c.id} value={c.id} aria-label={c.id} sx={{ justifyContent: 'flex-start' }}>
                    {t(c.id)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Grid>
          <Grid size={4}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('skill')}
            </Typography>
            {selectedCategoryId ? (
              <Box sx={{ display: 'flex' }}>
                <ToggleButtonGroup
                  orientation="vertical"
                  value={selectedSkill?.id ?? null}
                  exclusive
                  onChange={(_event, newSkillId) => {
                    const skill = filteredSkills.find((s) => s.id === newSkillId) ?? null;
                    setSelectedSkill(skill);
                  }}
                  fullWidth
                  size="small"
                  aria-label="skills"
                >
                  {filteredSkills.map((s) => (
                    <ToggleButton key={s.id} value={s.id} aria-label={s.id} sx={{ justifyContent: 'flex-start' }}>
                      {t(s.id)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('select-category-first')}
              </Typography>
            )}
          </Grid>
          <Grid size={4}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('specialization')}
            </Typography>
            {selectedSkill ? (
              <AddSkillSpecialization
                skill={selectedSkill}
                specialization={selectedSpecialization}
                setSpecialization={setSelectedSpecialization}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('select-skill-first')}
              </Typography>
            )}
            <pre>{JSON.stringify(selectedSkill, null, 2)}</pre>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('close')}</Button>
        <Button onClick={onAddSkill} variant="contained" disabled={!selectedSkill}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSkillDialog;
