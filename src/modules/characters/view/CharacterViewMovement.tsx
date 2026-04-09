import React, { FC, Fragment } from 'react';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { CategorySeparator, Character, Pace, RmuTextCard, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { imageBaseUrl } from '../../services/config';
import { gridSizeCard, greyScale } from '../../services/display';

interface TableItem {
  pace: Pace;
  roundModifier: number;
  phaseModifier: number;
  penalty: number | null;
  ap: number | null;
  loadLimit: number | null;
}

const movementTable: TableItem[] = [
  {
    pace: 'creep',
    roundModifier: 0.5,
    phaseModifier: 1 / 8,
    penalty: null,
    ap: null,
    loadLimit: null,
  },
  {
    pace: 'walk',
    roundModifier: 1,
    phaseModifier: 1 / 4,
    penalty: -25,
    ap: 1,
    loadLimit: 90,
  },
  {
    pace: 'jog',
    roundModifier: 2,
    phaseModifier: 1 / 2,
    penalty: -50,
    ap: 2,
    loadLimit: 60,
  },
  {
    pace: 'run',
    roundModifier: 3,
    phaseModifier: 3 / 4,
    penalty: -75,
    ap: 3,
    loadLimit: 45,
  },
  {
    pace: 'sprint',
    roundModifier: 4,
    phaseModifier: 1,
    penalty: null,
    ap: 4,
    loadLimit: 30,
  },
  {
    pace: 'dash',
    roundModifier: 5,
    phaseModifier: 1.25,
    penalty: null,
    ap: 4,
    loadLimit: 15,
  },
];

const CharacterViewMovement: FC<{
  character: Character;
  strategicGame: StrategicGame;
}> = ({ character, strategicGame }) => {
  if (!character || !strategicGame) return <div>Loading...</div>;

  const bmr = character.movement.baseMovementRate;
  const scale = strategicGame.options?.boardScaleMultiplier || 1;

  const round = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  const isDisabledPace = (pace: Pace): boolean => {
    const index = movementTable.findIndex((e) => pace === e.pace);
    const maxIndex = movementTable.findIndex((e) => character.movement.maxPace === e.pace);
    console.log(`${pace} ${index} ${maxIndex}`);
    return index > maxIndex;
  };

  return (
    <>
      <CategorySeparator text={t('Movement')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={bmr}
            subtitle={t('Base movement rate')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={greyScale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.maxPace}
            subtitle={t('Max pace')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={greyScale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty || '-'}`)}
            subtitle={t('Base difficulty')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={greyScale}
          />
        </Grid>
      </Grid>
      <CategorySeparator text={t('Stride modifiers')} />
      <Grid container spacing={1}>
        {character.movement?.modifiers &&
          Object.entries(character.movement.modifiers).map(([key, value]) => (
            <Grid key={key} size={gridSizeCard}>
              <RmuTextCard
                value={value}
                subtitle={t(key)}
                image={`${imageBaseUrl}images/generic/stride-bonus.png`}
                grayscale={greyScale}
              />
            </Grid>
          ))}
      </Grid>
      <CategorySeparator text={t('Board scale')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={scale}
            subtitle={t('Board scale')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={greyScale}
          />
        </Grid>
      </Grid>
      <CategorySeparator text={t('Speed table')} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Pace</TableCell>
              <TableCell align="right">Round</TableCell>
              <TableCell align="right">Phase</TableCell>
              <TableCell align="right">Penalty</TableCell>
              <TableCell align="right">AP</TableCell>
              <TableCell align="right">Load limit</TableCell>
              <TableCell align="right">Round</TableCell>
              <TableCell align="right">Phase</TableCell>
              <TableCell align="right">Round Scaled</TableCell>
              <TableCell align="right">Phase Scaled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movementTable.map((item, index) => {
              const disabled = isDisabledPace(item.pace);
              return (
                <TableRow
                  key={index}
                  sx={{
                    '& td, & th': {
                      color: (theme) => (disabled ? theme.palette.secondary.main : theme.palette.primary.main),
                    },
                  }}
                >
                  <TableCell>{t(item.pace)}</TableCell>
                  <TableCell align="right">{item.roundModifier}x BMR</TableCell>
                  <TableCell align="right">{item.phaseModifier}x BMR</TableCell>
                  <TableCell align="right">{item.penalty || '-'}</TableCell>
                  <TableCell align="right">{item.ap || '-'}</TableCell>
                  <TableCell align="right">{item.loadLimit ? `${item.loadLimit}%` : '-'}</TableCell>
                  <TableCell align="right">{round(item.roundModifier * bmr)}'</TableCell>
                  <TableCell align="right">{round(item.phaseModifier * bmr)}'</TableCell>
                  <TableCell align="right">{round(item.roundModifier * bmr * scale)}</TableCell>
                  <TableCell align="right">{round(item.phaseModifier * bmr * scale)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CharacterViewMovement;
