import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CategorySeparator, Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterHealingForm from './CharacterHealingForm';
import CharacterPermanentInjuryForm from './CharacterPermanentInjuryForm';

const CharacterHealingPanel: FC<{ character: Character }> = ({ character }) => {
  const { t } = useTranslation();

  return (
    <>
      <CategorySeparator text={t('healing')} />
      <CharacterHealingForm character={character} />
      <CharacterPermanentInjuryForm />
    </>
  );
};

export default CharacterHealingPanel;
