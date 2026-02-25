import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-games';
import CardListItem from './CardListItem';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;

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
      image={tacticalGame.imageUrl ? tacticalGame.imageUrl : `${imageBaseUrl}images/generic/tactical.png`}
      onClick={handleRealmClick}
    />
  );
};

export default TacticalGameCard;
