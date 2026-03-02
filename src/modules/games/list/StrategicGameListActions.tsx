import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { t } from 'i18next';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import AddButton from '../../shared/buttons/AddButton';
import RefreshButton from '../../shared/buttons/RefreshButton';

const StrategicGameListActions: FC = () => {
  const navigate = useNavigate();
  const breadcrumbs = [{ name: t('strategic'), link: '/strategic' }, { name: t('games') }];

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
