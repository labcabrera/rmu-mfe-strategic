import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

/** 12-column grid of the panels of a detail page; children set their span with `span()`. */
export const Bento = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2 }}>{children}</Box>
);

/** Column span from `sm` (tablet), `lg` and `xl` up; full width on phones. */
export const span = (sm: number, lg: number, xl = lg) => ({
  gridColumn: { xs: 'span 12', sm: `span ${sm}`, lg: `span ${lg}`, xl: `span ${xl}` },
});

/** Grid size of showcase cards inside a panel of 8 columns: three per row on desktop, not four (too narrow). */
export const PANEL_CARD_SIZE = { xs: 12, sm: 6, md: 4 } as const;
