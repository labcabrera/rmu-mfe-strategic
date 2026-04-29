import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Character, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../ErrorContext';

const TradeViewActions: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('character'), link: `/strategic/character/view/${character.id}` },
    { name: t('trade') },
  ];

  return (
    <>
      <RmuBreadcrumbs items={breadcrumbs}></RmuBreadcrumbs>
    </>
  );
};

export default TradeViewActions;
