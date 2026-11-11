import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip } from '@mui/material';
import {
  Character,
  DataTable,
  DataTableColumn,
  LevelUpButton,
  StatKey,
  STATS,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
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

  const canLevelUp =
    character.experience.availableStatLevelUp > 0 ||
    spendableDevPoints(character, strategicGame) >= STAT_GAIN_DEV_POINTS_COST;
  const freeUpdate = character.experience.availableStatLevelUp > 0;
  const statistic = (stat: StatKey) => character.statistics[stat];
  const modifier = (stat: StatKey, key: string) => statistic(stat).modifiers[key] || 0;
  const colored = (value: number, color: (value: number) => string, bold = false) => (
    <Box component="span" sx={{ color: color(value), fontWeight: bold ? 600 : undefined }}>
      {value}
    </Box>
  );
  const number = (
    key: string,
    header: string,
    value: (stat: StatKey) => number,
    color: (value: number) => string,
    bold = false
  ): DataTableColumn<StatKey> => ({
    key,
    header,
    align: 'right',
    render: (stat) => colored(value(stat), color, bold),
  });

  return (
    <>
      <DataTable
        rows={STATS.filter((stat) => !!character.statistics[stat].modifiers)}
        getKey={(stat) => stat}
        columns={[
          { key: 'stat', header: t('stat'), render: (stat) => t(stat) },
          number('potential', t('potential-short'), (stat) => statistic(stat).potential, statColor),
          number('temporary', t('temporary-short'), (stat) => statistic(stat).temporary, statColor),
          number('bonus', t('bonus-short'), (stat) => modifier(stat, 'stat'), bonusColor),
          number('racial', t('racial-short'), (stat) => modifier(stat, 'racial'), bonusColor),
          number('custom', t('custom-short'), (stat) => modifier(stat, 'trait'), bonusColor),
          number('total', t('total-short'), (stat) => statistic(stat).totalBonus, bonusColor, true),
          {
            key: 'level-up',
            header:
              character.experience.availableStatLevelUp > 0 ? (
                <Chip label={`+${character.experience.availableStatLevelUp}`} color="success" />
              ) : (
                ''
              ),
            align: 'right',
            render: (stat) =>
              canLevelUp && (
                <LevelUpButton onClick={() => onLevelUpButtonClick(stat)} color={freeUpdate ? 'success' : undefined} />
              ),
          },
        ]}
      />
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

const bonusColor = (value: number) => {
  if (value < 0) return 'error.main';
  if (value > 0) return 'success.main';
  return 'inherit';
};

const statColor = (value: number) => {
  if (value > 75) return 'success.main';
  if (value < 45) return 'error.main';
  return 'inherit';
};

export default CharacterViewStatsTable;
