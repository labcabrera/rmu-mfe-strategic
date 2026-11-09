import { Dispatch, Fragment, SetStateAction, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import {
  Character,
  CharacterSkill,
  DevPointsPool,
  EmptyState,
  Profession,
  skillCategoryOf,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { MAX_PROFESSIONAL_SKILLS, resolvePowerLevel } from '../../../services/game-rules';
import { COLUMNS, EXPAND, ProfessionalType, SkillRow, TableContext, WIDE } from './CharacterSkillRow';

const OTHER_CATEGORY = 'other';

/**
 * The skills of a character as a compact table: grouped by category, each row with the rank stepper of the level, the
 * professional and knack marks next to the name and the delete action in a menu. The details of a row show the
 * breakdown of the total in one line and, on phones, the columns that do not fit. `skills` comes already filtered and
 * sorted by name; the groups keep that order.
 */
export default function CharacterSkillTable({
  character,
  skills,
  setCharacter,
  profession,
  strategicGame,
  pool = 'auto',
}: {
  character: Character;
  skills?: CharacterSkill[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
  strategicGame?: StrategicGame;
  pool?: DevPointsPool;
}) {
  const { t, i18n } = useTranslation();
  const displayedSkills = skills ?? character.skills;
  const count = (type: ProfessionalType) => character.skills.filter((s) => s.professional?.includes(type)).length;
  const context: TableContext = {
    character,
    setCharacter,
    profession,
    strategicGame,
    pool,
    marked: { professional: count('professional'), knack: count('knack') },
    limits: { professional: MAX_PROFESSIONAL_SKILLS, knack: resolvePowerLevel(strategicGame?.powerLevel).knackCount },
  };

  const groups = useMemo(() => {
    const byCategory = new Map<string, CharacterSkill[]>();
    displayedSkills.forEach((skill) => {
      const category = skillCategoryOf(skill) ?? OTHER_CATEGORY;
      byCategory.set(category, [...(byCategory.get(category) ?? []), skill]);
    });
    return [...byCategory.entries()].sort(([a], [b]) => t(a).localeCompare(t(b), i18n.language));
  }, [displayedSkills, t, i18n.language]);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        sx={{
          '& td, & th': { px: { xs: 0.5, sm: 1 } },
          // Phones: tighter icon buttons, so that the total and the menu fit
          '& .MuiIconButton-sizeSmall': { p: { xs: 0.25, sm: 0.625 } },
          // The expand and menu buttons need no padding around them
          '& tr > td:first-of-type:not([colspan]), & tr > td:last-of-type:not([colspan]), & th:first-of-type, & th:last-of-type':
            { px: 0.25, width: 40 },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={EXPAND} />
            <TableCell>{t('skill')}</TableCell>
            <TableCell sx={WIDE}>{t('stats')}</TableCell>
            <TableCell align="center">
              <Tooltip title={t('developed-ranks')}>
                <span>{t('dev-ranks')}</span>
              </Tooltip>
            </TableCell>
            <TableCell align="right" sx={WIDE}>
              {t('ranks')}
            </TableCell>
            <TableCell align="right">{t('total')}</TableCell>
            <TableCell align="right" sx={WIDE}>
              <Tooltip title={t('development-cost')}>
                <span>{t('cost')}</span>
              </Tooltip>
            </TableCell>
            <TableCell sx={{ width: 40, px: 0.5 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map(([category, list]) => (
            <Fragment key={category}>
              <TableRow>
                <TableCell colSpan={COLUMNS} sx={{ bgcolor: 'action.hover', py: 0.25 }}>
                  <Typography variant="overline" color="text.secondary">
                    {`${t(category)} · ${list.length}`}
                  </Typography>
                </TableCell>
              </TableRow>
              {list.map((skill) => (
                <SkillRow key={`${skill.skillId}::${skill.specialization ?? ''}`} skill={skill} context={context} />
              ))}
            </Fragment>
          ))}
          {displayedSkills.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS}>
                <EmptyState dense title={t('not-found-skills')} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
