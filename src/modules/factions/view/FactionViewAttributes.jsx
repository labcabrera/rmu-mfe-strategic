/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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

const FactionViewAttributes = ({ faction, setFaction, strategicGame }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

      <Grid size={10}>
        <TextField
          label={t('game')}
          variant="standard"
          fullWidth
          value={strategicGame?.name || ''}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleOpenGame}>
                    <ArrowForwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <InfoField i18n="name" value={faction.name} size={10} />

      <Grid size={10}>
        <TextField
          label={t('available-xp')}
          variant="standard"
          fullWidth
          value={new Intl.NumberFormat('en-EN').format(faction.factionManagement.availableXP)}
          slotProps={{
            input: {
              endAdornment: (
                <>
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => handleAddXP(10000)}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => handleAddXP(-10000)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                </>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={10}>
        <TextField
          label={t('available-gold')}
          variant="standard"
          fullWidth
          value={faction.factionManagement.availableGold}
          slotProps={{
            input: {
              endAdornment: (
                <>
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => handleAddGold(1)}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => handleAddGold(-1)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                </>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={10}>
        <TextField label={t('description')} variant="standard" fullWidth value={faction.description} />
      </Grid>
    </Grid>
  );
};

export default FactionViewAttributes;
