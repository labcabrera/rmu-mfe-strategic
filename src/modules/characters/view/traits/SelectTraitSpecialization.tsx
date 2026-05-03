import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { fetchEnumerations, RmuSelect, Trait } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';

const SelectTraitSpecialization: FC<{
  value: any;
  trait: Trait;
  onChange: (value: string) => void;
}> = ({ value, trait, onChange }) => {
  const auth = useAuth();
  const { showError } = useError();
  const { t } = useTranslation();
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const bindSpecializations = () => {
    fetchEnumerations(`category==${trait.specialization}`, 0, 100, auth)
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
