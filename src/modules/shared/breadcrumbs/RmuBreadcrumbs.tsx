import React, { FC, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack, useTheme, useMediaQuery } from '@mui/material';
import { t } from 'i18next';

type BreadcrumbItem = {
  name: string;
  link?: string;
};

interface RmuBreadcrumbsProps {
  items?: BreadcrumbItem[];
  children?: ReactNode;
  maxNameLength?: number;
}

const RmuBreadcrumbs: FC<RmuBreadcrumbsProps> = ({ items, children, maxNameLength = 10 }) => {
  const defaultItems: BreadcrumbItem[] = [{ name: t('core'), link: '/core' }, { name: t('realms') }];

  const crumbs = items && items.length > 0 ? items : defaultItems;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxLen = Math.max(4, typeof maxNameLength === 'number' ? Math.floor(maxNameLength) : 20);

  const truncate = (s: string) => {
    if (!s) return s;
    if (s.length <= maxLen) return s;
    const take = Math.max(1, maxLen - 3);
    return s.slice(0, take) + '...';
  };

  return (
    <Stack
      spacing={1}
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems="center"
      mb={1}
    >
      <Box sx={{ width: '100%' }}>
        <Breadcrumbs aria-label="breadcrumb">
          {crumbs.map((it, idx) => {
            const display = isMobile ? truncate(it.name) : it.name;
            return it.link ? (
              <Link key={idx} component={RouterLink} color="primary" underline="always" to={it.link} title={it.name}>
                {display}
              </Link>
            ) : (
              <span key={idx} title={it.name}>
                {display}
              </span>
            );
          })}
        </Breadcrumbs>
      </Box>
      <Stack spacing={1} direction="row" sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' }, mt: { xs: 1, sm: 0 } }}>
        {children}
      </Stack>
    </Stack>
  );
};

export default RmuBreadcrumbs;
