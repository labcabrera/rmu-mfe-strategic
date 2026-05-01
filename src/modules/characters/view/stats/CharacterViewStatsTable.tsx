import React, { Dispatch, FC, Fragment, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Character, LevelUpButton, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import StatLevelUpDialog from './StatLevelUpDialog';

const LEVEL_UP_STAT_COST = 4;

const CharacterViewStatsTable: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  if (!character) return <div>Loading...</div>;

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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="left">Stat</TableCell>
              <TableCell align="right">P</TableCell>
              <TableCell align="right">T</TableCell>
              <TableCell align="right">Bon</TableCell>
              <TableCell align="right">Rac</TableCell>
              <TableCell align="right">Cus</TableCell>
              <TableCell align="right">Tot</TableCell>
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
                <CharacterViewStatsEntry stat={key} character={character} onLevelUp={onLevelUpButtonClick} />
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
  onLevelUp: (stat: StatKey) => void;
}> = ({ stat, character, onLevelUp }) => {
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
        {character.experience.availableDevPoints >= LEVEL_UP_STAT_COST && (
          <LevelUpButton onClick={() => onLevelUp(stat)} color={freeUpdate ? 'success' : undefined} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default CharacterViewStatsTable;
