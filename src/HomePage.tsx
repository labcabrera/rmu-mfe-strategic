import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EntityCard, CardGrid, LayoutBase } from '@labcabrera-rmu/rmu-react-shared-lib';

const OPTIONS = [
  {
    value: 'strategic-games',
    subtitle: 'manage-strategic-games',
    image: 'images/generic/strategic.png',
    to: '/strategic/games',
  },
  {
    value: 'factions',
    subtitle: 'manage-factions',
    image: 'images/generic/faction.png',
    to: '/strategic/factions',
  },
  {
    value: 'characters',
    subtitle: 'manage-characters',
    image: 'images/generic/races.png',
    to: '/strategic/characters',
  },
];

const HomePage: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <LayoutBase breadcrumbs={[{ name: t('home'), link: '/' }, { name: t('strategic-module') }]}>
      <CardGrid
        items={OPTIONS}
        getKey={(c) => c.value}
        renderItem={(c) => (
          <EntityCard title={t(c.value)} description={t(c.subtitle)} image={c.image} onClick={() => navigate(c.to)} />
        )}
      />
    </LayoutBase>
  );
};

export default HomePage;
