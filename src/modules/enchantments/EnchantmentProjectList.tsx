import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import {
  DataTable,
  EmptyState,
  EnchantmentProject,
  enchantmentTotalDays,
  LoadingState,
  MoneyDisplay,
  StatusBadge,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { enchantmentPercent, STATUS_COLORS } from './enchantment-format';

/** The enchantment projects of a holder, newest first; a row opens the project. */
const EnchantmentProjectList: FC<{
  projects: EnchantmentProject[] | undefined;
  onOpen: (project: EnchantmentProject) => void;
  onNew: () => void;
}> = ({ projects, onOpen, onNew }) => {
  const { t } = useTranslation();
  if (!projects) return <LoadingState />;
  if (projects.length === 0) {
    return (
      <EmptyState
        title={t('enchantments-empty')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}>
            {t('enchantment-new')}
          </Button>
        }
      />
    );
  }
  const rows = [...projects].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return (
    <DataTable
      rows={rows}
      getKey={(project) => project.id}
      onRowClick={onOpen}
      cardsOnMobile
      columns={[
        {
          key: 'item',
          header: t('item'),
          render: (project) => (
            <Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t(project.itemName, project.itemName)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {project.plan.spells.map((spell) => t(spell.name, spell.name)).join(', ')}
              </Typography>
            </Stack>
          ),
        },
        { key: 'alchemist', header: t('enchantment-alchemist'), render: (project) => project.alchemistName },
        {
          key: 'status',
          header: t('status'),
          render: (project) => (
            <StatusBadge
              status={`enchantment-${project.status}`}
              label={t(`enchantment-status-${project.status}`)}
              abbr={t(`enchantment-status-${project.status}`)}
              color={STATUS_COLORS[project.status]}
            />
          ),
        },
        {
          key: 'progress',
          header: t('enchantment-progress'),
          width: 180,
          render: (project) => (
            <Box>
              <LinearProgress variant="determinate" value={enchantmentPercent(project)} />
              <Typography variant="caption" color="text.secondary">
                {t('enchantment-days-of', { done: project.daysCompleted, total: enchantmentTotalDays(project) })}
              </Typography>
            </Box>
          ),
        },
        {
          key: 'value',
          header: t('enchantment-market-value'),
          align: 'right',
          render: (project) => <MoneyDisplay gold={project.plan.marketValue} />,
        },
      ]}
    />
  );
};

export default EnchantmentProjectList;
