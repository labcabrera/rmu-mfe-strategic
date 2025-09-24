import React, { useState, useEffect, FC, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SkillCategory } from '../../api/skill-category.dto';

interface NamedSkillCategory extends SkillCategory {
  name: string;
}

const SelectSkillCategory: FC<{
  categories: SkillCategory[];
  value: string | null | undefined;
  label: string;
  onChange: (skillCategory?: SkillCategory) => void;
}> = ({ categories, value, onChange, label }) => {
  const { t } = useTranslation();
  const [namedSkillCategories, setNamedSkillCategories] = useState<NamedSkillCategory[]>([]);

  useEffect(() => {
    if (categories) {
      const translatedCategories = categories.map((e: SkillCategory) => ({
        ...e,
        name: t(e.id),
      }));
      translatedCategories.sort((a, b) => a.name.localeCompare(b.name));
      setNamedSkillCategories(translatedCategories);
    }
  }, [categories]);

  const handleChange = (_event: SyntheticEvent, newValue: SkillCategory | null) => {
    onChange(newValue || undefined);
  };

  const selectedSkillCategory = namedSkillCategories.find((skill) => skill.id === value) || null;

  return (
    <Autocomplete
      options={namedSkillCategories}
      getOptionLabel={(option: NamedSkillCategory) => option.name}
      value={selectedSkillCategory}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label={label} variant="standard" fullWidth />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default SelectSkillCategory;
