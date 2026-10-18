import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, useTheme } from '@mui/material';
import { LoadingState, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function CharacterViewStatsChart({
  stats,
  minHeight = 240,
}: {
  stats: Record<StatKey, { potential: number; temporary: number }>;
  minHeight?: number | string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!stats) return <LoadingState />;

  const data = STATS.map((key) => ({
    stat: key,
    label: key,
    statPotential: stats[key].temporary ?? 0,
    potential: stats[key].potential ?? 0,
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke={theme.palette.divider} strokeWidth={1} />
          <PolarAngleAxis dataKey="label" />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          <Radar
            name={t('stat-potential')}
            dataKey="statPotential"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.6}
          />
          <Radar
            name={t('potential')}
            dataKey="potential"
            stroke={theme.palette.grey[600]}
            fill={theme.palette.grey[600]}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}
