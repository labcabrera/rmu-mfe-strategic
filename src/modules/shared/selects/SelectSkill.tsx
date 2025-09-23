import React, { useState, useEffect, FC, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Skill } from '../../api/skill.dto';

interface NamedSkill extends Skill {
  name: string;
}

const SelectSkill: FC<{
  skills: Skill[];
  value: string | null | undefined;
  label: string;
  onChange: (skill?: Skill) => void;
}> = ({ skills, value, onChange, label }) => {
  const { t } = useTranslation();
  const [namedSkills, setNamedSkills] = useState<NamedSkill[]>([]);

  useEffect(() => {
    if (skills) {
      const translatedSkills = skills.map((e: Skill) => ({
        ...e,
        name: t(e.id),
      }));
      translatedSkills.sort((a, b) => a.name.localeCompare(b.name));
      setNamedSkills(translatedSkills);
    }
  }, [skills]);

  const handleChange = (_event: SyntheticEvent, newValue: Skill | null) => {
    onChange(newValue || undefined);
  };

  const selectedSkill = namedSkills.find((skill) => skill.id === value) || null;

  return (
    <Autocomplete
      options={namedSkills}
      getOptionLabel={(option: NamedSkill) => option.name}
      value={selectedSkill}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label={label} variant="standard" fullWidth />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default SelectSkill;
