import React, { ChangeEvent, Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CreateCharacterDto } from '../../api/characters';
import { StrategicGame } from '../../api/strategic-games';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';

const red = '#ffab91';
const green = '#a5d6a7';

interface StatBonus {
  potential: number;
  temporary: number;
}

interface StatBonusFormData {
  [key: string]: StatBonus;
}

const CharacterStats: FC<{
  key: string;
  statKey: string;
  statName: string;
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  statBonusFormData: StatBonusFormData;
}> = ({ statKey, statName, formData, setFormData, statBonusFormData }) => {
  const { t } = useTranslation();

  const getColor = (value: number): string => {
    return value < 0 ? red : value > 0 ? green : 'inherit';
  };

  const getTotal = (): number => {
    const stat = formData.statistics[statKey];
    const bonus = statBonusFormData[statKey];
    return stat.racial + bonus.temporary;
  };

  return (
    <>
      <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t(statName)}
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>{formData.statistics[statKey].potential}</TableCell>
        <TableCell
          sx={{
            color: getColor(statBonusFormData[statKey].potential),
          }}
        >
          {statBonusFormData[statKey].potential}
        </TableCell>
        <TableCell>{formData.statistics[statKey].temporary}</TableCell>
        <TableCell
          sx={{
            color: getColor(statBonusFormData[statKey].temporary),
          }}
        >
          {statBonusFormData[statKey].temporary}
        </TableCell>
        <TableCell
          sx={{
            color: getColor(formData.statistics[statKey].racial),
          }}
        >
          {formData.statistics[statKey].racial}
        </TableCell>
        <TableCell
          sx={{
            color: getColor(getTotal()),
            fontWeight: 'bold',
          }}
        >
          {getTotal()}
        </TableCell>
      </TableRow>
    </>
  );
};

const statKeys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

const CharacterCreateStats: FC<{
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
}> = ({ strategicGame, formData, setFormData }) => {
  const { t } = useTranslation();

  const [statBonusFormData, setStatBonusFormData] = useState<StatBonusFormData>({
    ag: { potential: 0, temporary: 0 },
    co: { potential: 0, temporary: 0 },
    em: { potential: 0, temporary: 0 },
    in: { potential: 0, temporary: 0 },
    me: { potential: 0, temporary: 0 },
    pr: { potential: 0, temporary: 0 },
    qu: { potential: 0, temporary: 0 },
    re: { potential: 0, temporary: 0 },
    sd: { potential: 0, temporary: 0 },
    st: { potential: 0, temporary: 0 },
  });

  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid size={6}>
          <Typography variant="h6" color="primary">
            {t('statistics')}
          </Typography>
          <Table sx={{ minWidth: 650 }} aria-label="stats table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Stat</TableCell>
                <TableCell align="left">{t('potential')}</TableCell>
                <TableCell align="left">{t('potential-bonus')}</TableCell>
                <TableCell align="left">{t('temporary')}</TableCell>
                <TableCell align="left">{t('temporary-bonus')}</TableCell>
                <TableCell align="left">{t('racial')}</TableCell>
                <TableCell align="left">{t('total')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statKeys.map((key) => (
                <CharacterStats
                  key={key}
                  statKey={key}
                  statName={t(key)}
                  formData={formData}
                  setFormData={setFormData}
                  statBonusFormData={statBonusFormData}
                />
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={6}>
          <Typography variant="h6" color="primary">
            {t('boost')}
          </Typography>
          <CharacterCreateStatsActions
            strategicGame={strategicGame}
            formData={formData}
            setFormData={setFormData}
            setStatBonusFormData={setStatBonusFormData}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterCreateStats;
