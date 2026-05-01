import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddButton, RefreshButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';

const StrategicGameListActions: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const breadcrumbs = [{ name: t('strategic'), link: '/strategic' }, { name: t('strategic-games') }];

  const onCreateNewGame = () => {
    navigate('/strategic/games/create');
  };

  const onRefresh = () => {
    navigate('/strategic/games', { replace: true });
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <RefreshButton onClick={onRefresh} />
      <AddButton onClick={onCreateNewGame} />
    </RmuBreadcrumbs>
  );
};

export default StrategicGameListActions;
