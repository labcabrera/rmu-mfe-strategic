import React, { FC, PropsWithChildren } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';

type Props = {
  title?: string;
  defaultExpanded?: boolean;
};

const TechnicalInfo: FC<PropsWithChildren<Props>> = ({
  children,
  title = 'Technical info',
  defaultExpanded = false,
}) => {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default TechnicalInfo;
