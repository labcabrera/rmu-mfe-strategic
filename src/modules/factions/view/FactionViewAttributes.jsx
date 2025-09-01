/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { addFactionXP, addFactionGold } from '../../api/factions';

const InfoField = ({ i18n, value, size = 2 }) => {
  const { t } = useTranslation();

  return (
    <Grid item size={size}>
      <TextField label={t(i18n)} variant="standard" value={value} fullWidth />
    </Grid>
  );
};

const HeaderCategory = ({ i18nLabel }) => {
  const { t } = useTranslation();

  return (
    <Grid size={12}>
      <Typography variant="h6" color="primary">
        {t(i18nLabel)}
      </Typography>
    </Grid>
  );
};

const OptionButton = ({ onClick, label, icon = <AddCircleOutlineIcon /> }) => {
  return (
    <Button sx={{ minWidth: 100 }} startIcon={icon} variant="outlined" onClick={onClick}>
      {label}
    </Button>
  );
};

const FactionViewAttributes = ({ faction, setFaction, strategicGame }) => {
  const navigate = useNavigate();

  const handleOpenGame = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`);
  };

  const handleAddXP = async (amount) => {
    if (faction) {
      const updatedFaction = await addFactionXP(faction.id, amount);
      setFaction(updatedFaction);
    }
  };

  const handleAddGold = async (amount) => {
    if (faction) {
      const updatedFaction = await addFactionGold(faction.id, amount);
      setFaction(updatedFaction);
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <HeaderCategory i18nLabel="information" />

      <InfoField i18n="game" value={strategicGame?.name} size={6} />
      <Grid size={5}>
        <Box display="flex" gap={2}>
          <OptionButton onClick={() => handleOpenGame()} label="View" icon={<ArrowForwardIcon />} />
        </Box>
      </Grid>

      <InfoField i18n="name" value={faction.name} size={6} />
      <Grid size={4}></Grid>

      <InfoField i18n="available-xp" value={faction.factionManagement.availableXP} size={6} />
      <Grid size={4}>
        <Box display="flex" gap={2}>
          <OptionButton onClick={() => handleAddXP(10000)} label="10K" icon={<AddCircleOutlineIcon />} />
          <OptionButton onClick={() => handleAddXP(-10000)} label="10K" icon={<RemoveCircleOutlineIcon />} />
        </Box>
      </Grid>

      <InfoField i18n="available-gold" value={faction.factionManagement.availableGold} size={6} />
      <Grid size={4}>
        <Box display="flex" gap={2}>
          <OptionButton onClick={() => handleAddGold(1)} label="1G" icon={<AddCircleOutlineIcon />} />
          <OptionButton onClick={() => handleAddGold(-1)} label="1G" icon={<RemoveCircleOutlineIcon />} />
        </Box>
      </Grid>
      <InfoField i18n="description" value={faction.description} size={6} />
    </Grid>
  );
};

export default FactionViewAttributes;
