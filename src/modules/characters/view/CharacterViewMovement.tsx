import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import {
  CategorySeparator,
  Character,
  DataTable,
  DataTableColumn,
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

  // The paces above the maximum pace of the character are dimmed in the secondary colour.
  const paceCell = (item: TableItem, content: React.ReactNode) => (
    <Box component="span" sx={{ color: isDisabledPace(item.pace) ? 'secondary.main' : 'primary.main' }}>
      {content}
    </Box>
  );
  const column = (
    key: string,
    header: string,
    value: (item: TableItem) => React.ReactNode,
    align: 'left' | 'right' = 'right'
  ): DataTableColumn<TableItem> => ({ key, header, align, render: (item) => paceCell(item, value(item)) });
  const columns: DataTableColumn<TableItem>[] = [
    column('pace', t('pace'), (item) => t(item.pace), 'left'),
    column('round', t('round'), (item) => t('bmr-multiplier', { value: item.roundModifier })),
    column('phase', t('phase'), (item) => t('bmr-multiplier', { value: item.phaseModifier })),
    column('penalty', t('penalty'), (item) => item.penalty || '-'),
    column('ap', t('action-points-short'), (item) => item.ap || '-'),
    column('load-limit', t('load-limit'), (item) => (item.loadLimit ? `${item.loadLimit}%` : '-')),
    column('round-feet', t('round'), (item) => `${round(item.roundModifier * bmr)}'`),
    column('phase-feet', t('phase'), (item) => `${round(item.phaseModifier * bmr)}'`),
    column('round-scaled', t('round-scaled'), (item) => round(item.roundModifier * bmr * scale)),
    column('phase-scaled', t('phase-scaled'), (item) => round(item.phaseModifier * bmr * scale)),
  ];

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
      <DataTable rows={movementTable} getKey={(item) => item.pace} columns={columns} />
    </>
  );
};

export default CharacterViewMovement;
