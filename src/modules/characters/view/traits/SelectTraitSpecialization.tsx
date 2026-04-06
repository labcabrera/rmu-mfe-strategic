import React, { useState, useEffect, FC } from 'react';
import { fetchEnumerations } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { Trait } from '../../../api/trait.dto';
import RmuSelect from '../../../shared/selects/RmuSelect';

const SelectTraitSpecialization: FC<{
  value: any;
  trait: Trait;
  onChange: (value: string) => void;
}> = ({ value, trait, onChange }) => {
  const { showError } = useError();
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const bindSpecializations = () => {
    fetchEnumerations(`category==${trait.specialization}`, 0, 100)
      .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    bindSpecializations();
  }, []);

  if (!trait) return null;

  if (!availableSpecializations) return <p>Loading...</p>;

  return (
    <>
      <RmuSelect
        label={t('Specialization')}
        value={value}
        options={availableSpecializations}
        onChange={(e) => onChange(e)}
      />
    </>
  );
};

export default SelectTraitSpecialization;
