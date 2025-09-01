/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { fetchStrategicGames } from '../../api/strategic-games';

const SelectGame = ({ value, onChange, readonly = false, required = true }) => {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);

  const handleChange = (event) => {
    const value = event.target.value;
    const game = games.find((e) => e.id === value);
    onChange(value, game);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStrategicGames('', 0, 100);
      setGames(data);
    };
    fetchData();
  }, []);

  if (!games) {
    return <p>Loading...</p>;
  }

  return (
    <TextField
      select
      label={t('game')}
      value={value === undefined || value === null || games.length === 0 ? '' : value}
      variant="standard"
      readOnly={readonly}
      required={required}
      fullWidth
      onChange={handleChange}
    >
      {games.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectGame;
