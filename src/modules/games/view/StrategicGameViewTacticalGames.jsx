/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import TacticalGameListItem from '../../shared/list-items/TacticalGameListItem';

const StrategicGameViewTacticalGames = ({ strategicGame, tacticalGames }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNewTacticalGame = () => {
    navigate(`/tactical/games/create?strategicGame=${strategicGame.id}`);
  };

  if (!tacticalGames) {
    return <p>{t('loading')}</p>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" color="primary">
        {t('tactical-games')}
      </Typography>
      <List>
        {tacticalGames?.map((item) => (
          <TacticalGameListItem key={item.id} game={item} />
        ))}
      </List>
      {tacticalGames.length === 0 ? (
        <>
          <p>
            No tactical games found.{' '}
            <Link component="button" onClick={handleNewTacticalGame}>
              {t('create-new')}
            </Link>
          </p>
        </>
      ) : null}
    </Box>
  );
};

export default StrategicGameViewTacticalGames;
