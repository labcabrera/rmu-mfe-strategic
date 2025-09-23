import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RaceAvatar from '../../shared/avatars/RaceAvatar';

const CharacterViewResume: FC<{ character: Character; strategicGame: StrategicGame; faction: Faction }> = ({
  character,
  strategicGame,
  faction,
}) => {
  if (!character) return <div>Loading...</div>;

  return (
    <>
      <RaceAvatar raceName={character.info.raceName} size={300} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {character.name}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {character.info.raceName} - {t(character.info.professionId)} - {character.experience.availableLevel}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        <Link component={RouterLink} color="inherit" to={`/strategic/factions/view/${faction.id}`}>
          {strategicGame.name}
        </Link>
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        <Link component={RouterLink} color="inherit" to={`/strategic/factions/view/${faction.id}`}>
          {faction.name}
        </Link>
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {character.description}
      </Typography>
    </>
  );
};

export default CharacterViewResume;
