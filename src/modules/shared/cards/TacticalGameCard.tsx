import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-games';
import CardListItem from './CardListItem';

const TacticalGameCard: FC<{
  tacticalGame: TacticalGame;
}> = ({ tacticalGame }) => {
  const navigate = useNavigate();

  const handleRealmClick = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
  };

  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <CardListItem
      title={tacticalGame.name}
      subtitle={t(tacticalGame.descrtiption)}
      image="/static/images/generic/realm.png"
      onClick={handleRealmClick}
    />
  );
};

export default TacticalGameCard;
