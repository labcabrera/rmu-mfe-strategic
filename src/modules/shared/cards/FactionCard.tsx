import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Faction } from '../../api/faction.dto';
import CardListItem from './CardListItem';

const FactionCard: FC<{
  faction: Faction;
}> = ({ faction }) => {
  const navigate = useNavigate();

  const handleFactionClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } });
  };

  if (!faction) return <p>Loading...</p>;

  return (
    <CardListItem
      title={faction.name}
      subtitle={faction.description}
      image="/static/images/avatars/generic-faction-01.png"
      onClick={handleFactionClick}
    />
  );
};

export default FactionCard;
