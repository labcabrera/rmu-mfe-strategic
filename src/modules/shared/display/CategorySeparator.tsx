import React, { FC, ReactNode } from 'react';
import { Box, Divider, Typography } from '@mui/material';

const CategorySeparator: FC<{ text: string; children?: ReactNode }> = ({ text, children }) => {
  return (
    <Box mb={1} mt={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" color="text.secondary">
          {text}
        </Typography>
        {children ? <Box ml={2}>{children}</Box> : null}
      </Box>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};

export default CategorySeparator;
