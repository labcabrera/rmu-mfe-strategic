import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddButton, RefreshButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

const StrategicGameListActions: FC = () => {
  const navigate = useNavigate();
  const breadcrumbs = [{ name: t('Strategic'), link: '/strategic' }, { name: t('Games') }];

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
