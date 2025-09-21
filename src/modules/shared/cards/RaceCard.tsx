import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { Race } from '../../api/race.dto';
import { resolveRaceImage } from '../../services/race-avatar-service';
import CardListItem from './CardListItem';

const RaceCard: FC<{
  race: Race;
}> = ({ race }) => {
  const navigate = useNavigate();

  const handleRaceClick = () => {
    navigate(`/core/races/view/${race.id}`, { state: { race } });
  };

  const getSubtitle = () => {
    return `${race.realmName} - ${t(race.archetype)}`;
  };

  if (!race) return <p>Loading...</p>;

  return <CardListItem title={race.name} subtitle={getSubtitle()} image={resolveRaceImage(race.name)} onClick={handleRaceClick} />;
};

export default RaceCard;
