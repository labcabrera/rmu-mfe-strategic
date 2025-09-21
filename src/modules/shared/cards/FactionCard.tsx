import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Faction } from '../../api/faction.dto';
import { defaultFactionImage } from '../../services/image-service';
import CardListItem from './CardListItem';

const FactionCard: FC<{
  faction: Faction;
}> = ({ faction }) => {
  const navigate = useNavigate();

  const handleFactionClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } });
  };

  const getImage = () => {
    return faction.imageUrl ? faction.imageUrl : defaultFactionImage;
  };

  if (!faction) return <p>Loading...</p>;

  return (
    <CardListItem
      title={faction.name}
      subtitle={faction.shortDescription}
      image={getImage()}
      onClick={handleFactionClick}
    />
  );
};

export default FactionCard;
