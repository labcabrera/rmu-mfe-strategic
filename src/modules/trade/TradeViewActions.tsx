import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useError } from '../../ErrorContext';
import { Character } from '../api/character.dto';
import RmuBreadcrumbs from '../shared/breadcrumbs/RmuBreadcrumbs';

const TradeViewActions: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const navigate = useNavigate();
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
