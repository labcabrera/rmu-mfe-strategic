/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CharacterAvatar from '../avatars/CharacterAvatar';

const CharacterListItem = ({ character }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGameClick = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
  };

  const getDetail = () => {
    return t(character.info.race) + ' - ' + t(character.info.professionId) + ' - Level ' + character.experience.availableLevel;
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar sx={{ mr: 2 }}>
        <CharacterAvatar character={character} />
      </ListItemAvatar>
      <ListItemText primary={character.name} secondary={getDetail()} />
    </ListItemButton>
  );
};

export default CharacterListItem;
