/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const red = '#ffab91';
const green = '#a5d6a7';

const CharacterViewStatsEntry = ({ statKey, statName, character: character }) => {
  const { t } = useTranslation();

  // "potential": 68,
  // "temporary": 35,
  // "bonus": -3,
  // "racial": 0,
  // "custom": 0,
  // "totalBonus": -3

  return (
    <>
      <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t(statName)}
        </TableCell>
        <TableCell align="right" component="th" scope="row">
          {character.statistics[statKey].potential}
        </TableCell>
        <TableCell align="right">{character.statistics[statKey].temporary}</TableCell>
        <TableCell
          align="right"
          sx={{
            color: character.statistics[statKey].bonus < 0 ? red : character.statistics[statKey].bonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {character.statistics[statKey].bonus}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: character.statistics[statKey].racial < 0 ? red : character.statistics[statKey].racial > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {character.statistics[statKey].racial}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: character.statistics[statKey].custom < 0 ? red : character.statistics[statKey].custom > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {character.statistics[statKey].custom}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: character.statistics[statKey].totalBonus < 0 ? red : character.statistics[statKey].totalBonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {character.statistics[statKey].totalBonus}
        </TableCell>
      </TableRow>
      {/* <Grid item size={2}>
        {statName}
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Potential"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].potential}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Temporary"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].temporary}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Racial Bonus"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].racial}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: character.statistics[statKey].racial < 0 ? '#ffab91' : character.statistics[statKey].racial > 0 ? '#a5d6a7' : 'white',
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Bonus"
          variant="standard"
          name={statKey}
          readonly
          value={character.statistics[statKey].bonus}
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: character.statistics[statKey].bonus < 0 ? '#ffab91' : character.statistics[statKey].bonus > 0 ? '#a5d6a7' : 'white',
              fontWeight: 'bold',
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}></Grid> */}
    </>
  );
};

const CharacterViewStats = ({ character }) => {
  const { t } = useTranslation();
  return (
    <>
      <Table sx={{ minWidth: 650 }} aria-label="stats table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Stat</TableCell>
            <TableCell align="right">{t('potential')}</TableCell>
            <TableCell align="right">{t('temporary')}</TableCell>
            <TableCell align="right">{t('bonus')}</TableCell>
            <TableCell align="right">{t('racial')}</TableCell>
            <TableCell align="right">{t('custom')}</TableCell>
            <TableCell align="right">{t('total')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <CharacterViewStatsEntry statKey="ag" statName="ag" character={character} />
          <CharacterViewStatsEntry statKey="co" statName="co" character={character} />
          <CharacterViewStatsEntry statKey="em" statName="em" character={character} />
          <CharacterViewStatsEntry statKey="in" statName="in" character={character} />
          <CharacterViewStatsEntry statKey="me" statName="me" character={character} />
          <CharacterViewStatsEntry statKey="pr" statName="pr" character={character} />
          <CharacterViewStatsEntry statKey="qu" statName="qu" character={character} />
          <CharacterViewStatsEntry statKey="re" statName="re" character={character} />
          <CharacterViewStatsEntry statKey="sd" statName="sd" character={character} />
          <CharacterViewStatsEntry statKey="st" statName="st" character={character} />
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterViewStats;
