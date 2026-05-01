import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { Character } from '@labcabrera-rmu/rmu-react-shared-lib';

type SortField = 'name' | 'level' | null;
type SortDirection = 'asc' | 'desc';

const FactionViewCharactersTable: FC<{ characters: Character[] }> = ({ characters }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!characters) return <p>Loading...</p>;

  const sortedCharacters = useMemo(() => {
    if (!characters) return [] as Character[];
    const list = [...characters];
    const cmp = (a: Character, b: Character) => {
      if (sortField === 'level') {
        const la = a.experience?.level ?? 0;
        const lb = b.experience?.level ?? 0;
        if (la !== lb) return la - lb;
        return (a.name || '').localeCompare(b.name || '');
      }
      // default: name
      return (a.name || '').localeCompare(b.name || '');
    };
    list.sort((a, b) => (sortDirection === 'asc' ? cmp(a, b) : -cmp(a, b)));
    return list;
  }, [characters, sortField, sortDirection]);

  const getAttackDescription = (character: Character): string => {
    if (!character.attacks || character.attacks.length === 0) return '-';
    return character.attacks.map((a) => `${t(a.attackTable || '')}: ${a.bo ?? ''}`.trim()).join(', ');
  };

  const getArmorDescription = (character: Character): string => {
    if (!character.defense || !character.defense.armor) return '-';
    if (character.defense.armor.at) return `${character.defense.armor.at}`;
    return `${character.defense.armor.headAt}/${character.defense.armor.bodyAt}/${character.defense.armor.armsAt}/${character.defense.armor.legsAt}`;
  };

  const getExperienceLabel = (c: Character): string => {
    if (c.experience.level < c.experience.availableLevel) {
      return `${c.experience.level} (${c.experience.availableLevel})`;
    }
    return `${c.experience.level}`;
  };

  return (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table size="small" aria-label="faction characters table">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === 'name'}
                direction={sortField === 'name' ? sortDirection : 'asc'}
                onClick={() => {
                  if (sortField === 'name') {
                    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setSortField('name');
                    setSortDirection('asc');
                  }
                }}
              >
                {t('name')}
              </TableSortLabel>
            </TableCell>
            <TableCell>{t('race')}</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'level'}
                direction={sortField === 'level' ? sortDirection : 'asc'}
                onClick={() => {
                  if (sortField === 'level') {
                    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setSortField('level');
                    setSortDirection('desc');
                  }
                }}
              >
                {t('level')}
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">HP</TableCell>
            <TableCell>{t('profession')}</TableCell>
            <TableCell>{t('attacks')}</TableCell>
            <TableCell align="right">DB</TableCell>
            <TableCell align="right">AT</TableCell>
            <TableCell align="right">Ini</TableCell>
            <TableCell align="right">BMR</TableCell>
            <TableCell align="right">Pen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCharacters.map((c) => (
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
              <TableCell align="right">{getExperienceLabel(c)}</TableCell>
              <TableCell align="right">
                {c.hp.current === c.hp.max ? c.hp.max : `${c.hp.current}/${c.hp.max}`}
              </TableCell>
              <TableCell>{t(c.info?.professionId || '')}</TableCell>
              <TableCell>{getAttackDescription(c)}</TableCell>
              <TableCell align="right">
                <Typography color={c.defense.defensiveBonus < 0 ? 'error' : 'success'}>
                  {c.defense.defensiveBonus}
                </Typography>
              </TableCell>
              <TableCell align="right">{getArmorDescription(c)}</TableCell>
              <TableCell align="right">
                <Typography color={c.initiative.totalBonus < 0 ? 'error' : 'success'}>
                  {c.initiative.totalBonus}
                </Typography>
              </TableCell>
              <TableCell align="right">{c.movement.baseMovementRate}</TableCell>
              <TableCell align="right">
                <Typography color={c.equipment.maneuverPenalty < 0 ? 'error' : 'success'}>
                  {c.equipment.maneuverPenalty}
                </Typography>
              </TableCell>
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
