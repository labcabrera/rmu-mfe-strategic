import React, { Dispatch, FC, Fragment, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Character, LevelUpButton, StatKey, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { spendableDevPoints, STAT_GAIN_DEV_POINTS_COST } from '../../../services/game-rules';
import StatLevelUpDialog from './StatLevelUpDialog';

/** Width that fits every column of the compact stats table (8 columns); narrower panels scroll it. */
export const STATS_TABLE_MIN_WIDTH = 520;

const CharacterViewStatsTable: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => {
  const { t } = useTranslation();
  const [levelUpStatDialogOpen, setLevelUpStatDialogOpen] = useState<boolean>(false);
  const [levelUpStat, setLevelUpStat] = useState<StatKey>();

  const onLevelUpButtonClick = (stat: StatKey) => {
    setLevelUpStat(stat);
    setLevelUpStatDialogOpen(true);
  };

  const onCloseLevelUpDialog = () => {
    setLevelUpStatDialogOpen(false);
    setLevelUpStat(undefined);
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: STATS_TABLE_MIN_WIDTH }}>
          <TableHead>
            <TableRow>
              <TableCell align="left">{t('stat')}</TableCell>
              <TableCell align="right">{t('potential-short')}</TableCell>
              <TableCell align="right">{t('temporary-short')}</TableCell>
              <TableCell align="right">{t('bonus-short')}</TableCell>
              <TableCell align="right">{t('racial-short')}</TableCell>
              <TableCell align="right">{t('custom-short')}</TableCell>
              <TableCell align="right">{t('total-short')}</TableCell>
              <TableCell align="right">
                {character.experience.availableStatLevelUp > 0 && (
                  <Chip label={`+${character.experience.availableStatLevelUp}`} color="success" />
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STATS.map((key, index) => (
              <Fragment key={index}>
                <CharacterViewStatsEntry
                  stat={key}
                  character={character}
                  canLevelUp={
                    character.experience.availableStatLevelUp > 0 ||
                    spendableDevPoints(character, strategicGame) >= STAT_GAIN_DEV_POINTS_COST
                  }
                  onLevelUp={onLevelUpButtonClick}
                />
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <StatLevelUpDialog
        character={character}
        stat={levelUpStat}
        open={levelUpStatDialogOpen}
        setCharacter={setCharacter}
        onClose={() => onCloseLevelUpDialog()}
      />
    </>
  );
};

const CharacterViewStatsEntry: FC<{
  stat: StatKey;
  character: Character;
  canLevelUp: boolean;
  onLevelUp: (stat: StatKey) => void;
}> = ({ stat, character, canLevelUp, onLevelUp }) => {
  const { t } = useTranslation();

  if (!character.statistics[stat].modifiers) return;
  const potential = character.statistics[stat].potential;
  const temporary = character.statistics[stat].temporary;
  const statBonus = character.statistics[stat].modifiers['stat'] || 0;
  const racial = character.statistics[stat].modifiers['racial'] || 0;
  const trait = character.statistics[stat].modifiers['trait'] || 0;
  const totalBonus = character.statistics[stat].totalBonus;
  const freeUpdate = character.experience.availableStatLevelUp > 0;

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const getStatColor = (value: number) => {
    if (value > 75) return 'success.main';
    if (value < 45) return 'error.main';
    return 'inherit';
  };

  return (
    <TableRow>
      <TableCell>{t(stat)}</TableCell>
      <TableCell align="right" sx={{ color: getStatColor(potential) }}>
        {potential}
      </TableCell>
      <TableCell align="right" sx={{ color: getStatColor(temporary) }}>
        {temporary}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(statBonus) }}>
        {statBonus}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(racial) }}>
        {racial}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(trait) }}>
        {trait}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(totalBonus), fontWeight: 'bold' }}>
        {totalBonus}
      </TableCell>
      <TableCell align="right">
        {canLevelUp && <LevelUpButton onClick={() => onLevelUp(stat)} color={freeUpdate ? 'success' : undefined} />}
      </TableCell>
    </TableRow>
  );
};

export default CharacterViewStatsTable;
