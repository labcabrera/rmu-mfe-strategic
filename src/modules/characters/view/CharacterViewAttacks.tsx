import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { CategorySeparator, Character, CharacterAttack, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';

const CharacterViewAttacks: FC<{
  character: Character;
  strategicGame: StrategicGame;
}> = ({ character, strategicGame }) => {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const getMeleeRangeFormated = (attack: CharacterAttack): string => {
    if (!attack.meleeRange) return '-';
    if (!strategicGame || !strategicGame.options || !strategicGame.options.boardScaleMultiplier) {
      return `${attack.meleeRange}'`;
    } else if (strategicGame.options.boardScaleMultiplier === 1) {
      return `${attack.meleeRange}'`;
    }
    const scaled = Math.round(attack.meleeRange * (strategicGame.options.boardScaleMultiplier || 1) * 10) / 10;
    return `${attack.meleeRange}' (${scaled}")`;
  };

  const getFumbleText = (attack: CharacterAttack): string => {
    if (attack.fumble === attack.weaponFumble) return `${attack.fumble}`;
    return `${attack.fumble} (${attack.weaponFumble})`;
  };

  return (
    <>
      <CategorySeparator text={t('attacks')} />
      <Paper sx={{ width: 'fit-content', padding: 2 }}>
        <Table aria-label="item table">
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
              <TableCell align="left">{t('type')}</TableCell>
              <TableCell align="left">{t('attack-table')}</TableCell>
              <TableCell align="left">{t('fumble-table')}</TableCell>
              <TableCell align="left">{t('size-adjustment')}</TableCell>
              <TableCell align="left">{t('fumble')}</TableCell>
              <TableCell align="left">{t('offensive-bonus')}</TableCell>
              <TableCell align="left">{t('melee-range')}</TableCell>
              <TableCell align="left">{t('bo-modifiers')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.attacks.map((attack, index) => (
              <TableRow key={index}>
                <TableCell align="left">{t(attack.attackName)}</TableCell>
                <TableCell align="left">{t(attack.type)}</TableCell>
                <TableCell align="left">{t(attack.attackTable)}</TableCell>
                <TableCell align="left">{t(attack.fumbleTable)}</TableCell>
                <TableCell align="right">{attack.sizeAdjustment}</TableCell>
                <TableCell align="right">{getFumbleText(attack)}</TableCell>
                <TableCell align="right" sx={{ color: getColor(attack.bo), fontWeight: 'bold' }}>
                  {attack.bo}
                </TableCell>
                <TableCell align="right">{getMeleeRangeFormated(attack)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1}>
                    {attack.boModifiers &&
                      Object.entries(attack.boModifiers)
                        .filter(([, v]) => v !== 0)
                        .map(([k, v]) => (
                          <Chip
                            key={k}
                            label={`${t(k)}: ${v > 0 ? '+' : ''}${v}`}
                            size="small"
                            color={v < 0 ? 'error' : 'primary'}
                          />
                        ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default CharacterViewAttacks;
