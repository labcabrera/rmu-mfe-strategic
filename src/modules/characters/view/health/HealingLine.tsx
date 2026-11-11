import { FC, ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

/** One label and value line of the healing previews. */
const HealingLine: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Stack>
);

export default HealingLine;
