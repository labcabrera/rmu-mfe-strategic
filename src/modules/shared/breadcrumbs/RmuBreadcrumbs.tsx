import React, { FC, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';

type BreadcrumbItem = {
  name: string;
  link?: string;
};

interface RmuBreadcrumbsProps {
  items: BreadcrumbItem[];
  children?: ReactNode;
}

const RmuBreadcrumbs: FC<RmuBreadcrumbsProps> = ({ items, children }) => {
  return (
    <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" mb={1}>
      <Box sx={{ width: '100%' }}>
        <Breadcrumbs aria-label="breadcrumb">
          {items.map((it, idx) => {
            const display = it.name;
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
      <Stack spacing={1} direction="row" sx={{ flexShrink: 0 }}>
        {children}
      </Stack>
    </Stack>
  );
};

export default RmuBreadcrumbs;
