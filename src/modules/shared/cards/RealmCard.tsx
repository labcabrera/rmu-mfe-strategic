import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-games';
import CardListItem from './CardListItem';

const RealmCard: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  const navigate = useNavigate();

  const handleRealmClick = () => {
    navigate(`/core/realms/view/${strategicGame.id}`, { state: { realm: strategicGame } });
  };

  if (!strategicGame) return <p>Loading...</p>;

  return (
    <CardListItem
      title={strategicGame.name}
      subtitle={t(strategicGame.shortDescription)}
      image="/static/images/generic/realm.png"
      onClick={handleRealmClick}
    />
  );
};

export default RealmCard;
