import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';

const FactionViewCharactersTable: FC<{ characters: Character[] }> = ({ characters }) => {
  const navigate = useNavigate();

  if (!characters) return <>{t('loading')}</>;

  const getAttackDescription = (c: Character): string => {
    if (!c.attacks || c.attacks.length === 0) return '-';
    return c.attacks.map((a) => `${t(a.attackTable || '')}: ${a.bo ?? ''}`.trim()).join(', ');
  };

  const getArmorDescription = (c: Character): string => {
    if (!c.defense || !c.defense.armor) return '-';
    if (c.defense.armor.at) return `${c.defense.armor.at}`;
    return `${c.defense.armor.headAt}/${c.defense.armor.bodyAt}/${c.defense.armor.armsAt}/${c.defense.armor.legsAt}`;
  };

  return (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table size="small" aria-label="faction characters table">
        <TableHead
          sx={{
            '& .MuiTableCell-root': {
              color: 'primary.main',
              fontWeight: 'bold',
            },
          }}
        >
          <TableRow>
            <TableCell>{t('name')}</TableCell>
            <TableCell>{t('race')}</TableCell>
            <TableCell align="right">{t('level')}</TableCell>
            <TableCell>{t('profession')}</TableCell>
            <TableCell>{t('attacks')}</TableCell>
            <TableCell>{t('DB')}</TableCell>
            <TableCell>{t('AT')}</TableCell>
            <TableCell align="right">HP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {characters.map((c) => (
            <TableRow
              key={c.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/strategic/characters/view/${c.id}`, { state: { character: c } })}
            >
              <TableCell>
                <Tooltip title={c.description || ''}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={c.imageUrl} alt={c.name} sx={{ width: 45, height: 45 }} variant="square" />
                    <Typography variant="body2">{c.name}</Typography>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell>{c.info?.race?.name}</TableCell>
              <TableCell align="right">{c.experience?.level ?? '-'}</TableCell>
              <TableCell>{t(c.info?.professionId || '')}</TableCell>
              <TableCell>{getAttackDescription(c)}</TableCell>
              <TableCell>{c.defense.defensiveBonus}</TableCell>
              <TableCell>{getArmorDescription(c)}</TableCell>
              <TableCell align="right">{c.hp ? `${c.hp.current}/${c.hp.max}` : '-'}</TableCell>
            </TableRow>
          ))}
          {characters.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>{t('No characters have been created')}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FactionViewCharactersTable;
