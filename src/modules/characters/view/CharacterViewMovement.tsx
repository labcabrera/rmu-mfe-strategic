import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {
  CategorySeparator,
  Character,
  gridSizeCard,
  LoadingState,
  Pace,
  EntityCard,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

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
  const { t } = useTranslation();
  if (!character || !strategicGame) return <LoadingState />;

  const bmr = character.movement.baseMovementRate;
  const scale = strategicGame.options?.boardScaleMultiplier || 1;

  const round = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  const isDisabledPace = (pace: Pace): boolean => {
    const index = movementTable.findIndex((e) => pace === e.pace);
    const maxIndex = movementTable.findIndex((e) => character.movement.maxPace === e.pace);
    return index > maxIndex;
  };

  return (
    <>
      <CategorySeparator text={t('movement')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <EntityCard title={`${bmr}`} subtitle={t('base-movement-rate')} noImage />
        </Grid>
        <Grid size={gridSizeCard}>
          <EntityCard title={`${t(character.movement.maxPace)}`} subtitle={t('max-pace')} noImage />
        </Grid>
        <Grid size={gridSizeCard}>
          <EntityCard
            title={`${t(`difficulty-${character.equipment.movementBaseDifficulty || '-'}`)}`}
            subtitle={t('base-difficulty')}
            noImage
          />
        </Grid>
      </Grid>
      <CategorySeparator text={t('stride-modifiers')} />
      <Grid container spacing={1}>
        {character.movement?.modifiers &&
          Object.entries(character.movement.modifiers).map(([key, value]) => (
            <Grid key={key} size={gridSizeCard}>
              <EntityCard title={`${value}`} subtitle={t(key)} noImage />
            </Grid>
          ))}
      </Grid>
      <CategorySeparator text={t('board-scale')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <EntityCard title={`${scale}`} subtitle={t('board-scale')} noImage />
        </Grid>
      </Grid>
      <CategorySeparator text={t('speed-table')} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('pace')}</TableCell>
              <TableCell align="right">{t('round')}</TableCell>
              <TableCell align="right">{t('phase')}</TableCell>
              <TableCell align="right">{t('penalty')}</TableCell>
              <TableCell align="right">{t('action-points-short')}</TableCell>
              <TableCell align="right">{t('load-limit')}</TableCell>
              <TableCell align="right">{t('round')}</TableCell>
              <TableCell align="right">{t('phase')}</TableCell>
              <TableCell align="right">{t('round-scaled')}</TableCell>
              <TableCell align="right">{t('phase-scaled')}</TableCell>
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
                  <TableCell align="right">{t('bmr-multiplier', { value: item.roundModifier })}</TableCell>
                  <TableCell align="right">{t('bmr-multiplier', { value: item.phaseModifier })}</TableCell>
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
