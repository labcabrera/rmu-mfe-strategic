import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import EditSquareIcon from '@mui/icons-material/EditSquare';
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
import { addSkill } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { fetchEnumerations } from '../../../api/enumerations';
import { fetchSkills } from '../../../api/skill';
import { fetchSkillCategories } from '../../../api/skill-category';
import { SkillCategory } from '../../../api/skill-category.dto';
import { AddSkill, Skill } from '../../../api/skill.dto';

const AddSkillDialog: FC<{
  open: boolean;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  onClose: () => void;
}> = ({ open, character, setCharacter, onClose }) => {
  const { showError } = useError();
  const [formData, setFormData] = useState<AddSkill>({ ranks: 0 } as AddSkill);
  const [validFormData, setValidFormData] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [availableCategories, setAvailableCategories] = useState<SkillCategory[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const bindSkillCategories = () => {
    fetchSkillCategories()
      .then((data) => setAvailableCategories(data.content))
      .catch((error) => showError(error.message));
  };

  const bindSkills = () => {
    if (!selectedCategory) return;
    fetchSkills(selectedCategory.id)
      .then((data) => setAvailableSkills(data.content))
      .catch((error) => showError(error.message));
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onAddSkill = async () => {
    addSkill(character.id, formData!)
      .then((response) => {
        setCharacter(response);
        reset();
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  const isValid = (): boolean => {
    if (!formData || !selectedSkill) return false;
    if (!formData.skillId) return false;
    if (!formData.specialization && selectedSkill.specialization) return false;
    return true;
  };

  const reset = () => {
    setSelectedCategory(undefined);
    setFormData({ ranks: 0 } as AddSkill);
  };

  useEffect(() => {
    setValidFormData(isValid());
  }, [formData]);

  useEffect(() => {
    if (selectedSkill) {
      setFormData((prev) => ({ ...prev, skillId: selectedSkill.id }));
      if (!selectedSkill.specialization) {
        setAvailableSpecializations(undefined);
      } else {
        fetchEnumerations(`category==${selectedSkill.specialization}`, 0, 100)
          .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
          .catch((err) => showError(err.message));
      }
    }
  }, [selectedSkill]);

  useEffect(() => {
    bindSkills();
    setAvailableSpecializations(undefined);
  }, [selectedCategory, character]);

  useEffect(() => {
    bindSkillCategories();
  }, [character]);

  if (!availableCategories) return <p>Loading...</p>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('Add skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={4}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('Skill category')}
            </Typography>
            <SelectionList
              value={selectedCategory}
              options={availableCategories}
              onChange={(value: any) => setSelectedCategory(value)}
              formatter={(value: any) => t(value.id as string)}
            />
          </Grid>
          <Grid size={4}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('Skill')}
            </Typography>
            {selectedCategory ? (
              <SelectionList
                value={selectedSkill}
                options={availableSkills}
                onChange={(value: any) => setSelectedSkill(value as Skill)}
                formatter={(value: any) => {
                  return (
                    <>
                      {t(value.id)}
                      {value.specialization && <EditSquareIcon sx={{ ml: 1, fontSize: '0.8em' }} />}
                    </>
                  );
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('select-skill-category-first')}
              </Typography>
            )}
          </Grid>
          <Grid size={4}>
            {formData?.skillId && availableSpecializations && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t('Specialization')}
                </Typography>
                <SelectionList
                  value={formData.specialization}
                  options={availableSpecializations}
                  onChange={(value) => setFormData((prev) => ({ ...prev, specialization: value }))}
                  formatter={(value: any) => t(value as string)}
                />
              </>
            )}
          </Grid>
          {/* {<pre>FormData: {JSON.stringify(formData, null, 2)}</pre>} */}
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

const SelectionList: FC<{
  value: any;
  options: any[];
  onChange: (value: any) => void;
  formatter: (value: any) => any;
}> = ({ value, options, onChange, formatter }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <ToggleButtonGroup
        orientation="vertical"
        value={value}
        exclusive
        onChange={(_event, skill) => onChange(skill)}
        size="small"
        fullWidth
      >
        {options.map((s) => (
          <ToggleButton key={`option-${s.id}`} value={s} sx={{ justifyContent: 'flex-start' }}>
            {formatter(s)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default AddSkillDialog;
