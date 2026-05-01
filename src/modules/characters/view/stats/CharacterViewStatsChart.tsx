import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export default function CharacterViewStatsChart({
  stats,
  minHeight = 240,
}: {
  stats: Record<StatKey, { potential: number; temporary: number }>;
  minHeight?: number | string;
}) {
  const { t } = useTranslation();

  if (!stats) return <div>Loading chart...</div>;

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
          <PolarGrid stroke="#363a3eff" strokeWidth={1} />
          <PolarAngleAxis dataKey="label" />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar name={t('statPotential')} dataKey="statPotential" stroke="#90A4AE" fill="#90A4AE" fillOpacity={0.6} />
          <Radar name={t('potential')} dataKey="potential" stroke="#757575" fill="#757575" fillOpacity={0.4} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}
