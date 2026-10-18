import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { fetchEnumerations, LoadingState, RmuSelect, Trait, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

const SelectTraitSpecialization: FC<{
  value: any;
  trait: Trait;
  onChange: (value: string) => void;
}> = ({ value, trait, onChange }) => {
  const auth = useAuth();
  const notify = useNotify();
  const { t } = useTranslation();
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const bindSpecializations = () => {
    fetchEnumerations(`category==${trait.specialization}`, 0, 100, auth)
      .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
      .catch((err) => notify.error(err));
  };

  useEffect(() => {
    bindSpecializations();
  }, []);

  if (!trait) return null;

  if (!availableSpecializations) return <LoadingState />;

  return (
    <>
      <RmuSelect
        label={t('specialization')}
        value={value}
        options={availableSpecializations}
        onChange={(e) => onChange(e)}
      />
    </>
  );
};

export default SelectTraitSpecialization;
