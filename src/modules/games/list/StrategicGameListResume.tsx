import React, { FC } from 'react';
import { Typography } from '@mui/material';

const StrategicGameListResume: FC = () => {
  return (
    <>
      <Typography variant="body1" mt={5}>
        A strategic game is a campaign that takes place in a specific realm. A campaign consists of one or more
        factions, and each faction will define the characters that players control. Each campaign will have different
        encounters, called tactical games, where different factions will fight each other or against environmental NPCs.
      </Typography>
      <Typography variant="body1" mt={3}>
        For example, we could have a campaign called <i>The Destruction of the One Ring</i> that takes place in the
        realm “Middle-earth Third Age” with the factions “The Fellowship of the Ring” and another faction, for example,
        “Moria.” The crossing of Moria and the escape attempt would be the tactical battle.
      </Typography>
    </>
  );
};

export default StrategicGameListResume;
