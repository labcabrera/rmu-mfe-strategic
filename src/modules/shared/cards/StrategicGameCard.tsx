import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { defaultStrategicGameImage } from '../../services/image-service';
import CardListItem from './CardListItem';

const StrategicGameCard: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  const navigate = useNavigate();

  const handleRealmClick = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame } });
  };

  const getImage = () => {
    return strategicGame.imageUrl ? strategicGame.imageUrl : defaultStrategicGameImage;
  };

  if (!strategicGame) return <p>Loading...</p>;

  return (
    <CardListItem
      title={strategicGame.name}
      subtitle={t(strategicGame.realmName)}
      image={getImage()}
      onClick={handleRealmClick}
    />
  );
};

export default StrategicGameCard;
