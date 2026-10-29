import React, { Dispatch, FC, Fragment, SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveIcon from '@mui/icons-material/Remove';
import SquareIcon from '@mui/icons-material/Square';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import {
  Box,
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
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
  deleteCharacterSkill,
  formatBonus,
  levelDownSkill,
  levelUpSkill,
  Profession,
  setUpProfessionalSkill,
  skillCategoryOf,
  StrategicGame,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  MAX_PROFESSIONAL_SKILLS,
  maxRanksPerLevel,
  resolvePowerLevel,
  spendableDevPoints,
} from '../../../services/game-rules';
import { useStrategicNotify } from '../../../services/notify-service';
import MissingReferenceChip from '../../../shared/chips/MissingReferenceChip';

/** Columns hidden on phones: they go to the details of the row. */
const WIDE = { display: { xs: 'none', md: 'table-cell' } };
/** The expand column, also hidden on phones. */
const EXPAND = { display: { xs: 'none', sm: 'table-cell' } };
const COLUMNS = 8;
const OTHER_CATEGORY = 'other';

type ProfessionalType = 'professional' | 'knack';
const PROFESSIONAL: ProfessionalType = 'professional';
const KNACK: ProfessionalType = 'knack';

/** What the rows need to know about the whole character. */
type TableContext = {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
  strategicGame?: StrategicGame;
  /** Marked skills of each type, and how many the character may have. */
  marked: Record<ProfessionalType, number>;
  limits: Record<ProfessionalType, number>;
};

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
}: {
  character: Character;
  skills?: CharacterSkill[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
  strategicGame?: StrategicGame;
}) {
  const { t, i18n } = useTranslation();
  const displayedSkills = skills ?? character.skills;
  const count = (type: ProfessionalType) => character.skills.filter((s) => s.professional?.includes(type)).length;
  const context: TableContext = {
    character,
    setCharacter,
    profession,
    strategicGame,
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
                <Typography variant="body2" color="text.secondary">
                  {t('not-found-skills')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const bonusColor = (value: number) => (value < 0 ? 'error.main' : value > 0 ? 'success.main' : 'text.secondary');

function SkillRow({ skill, context }: { skill: CharacterSkill; context: TableContext }) {
  // Spec 050: specializations are catalog keys shown by their name
  const specializationLabel = useSpecializationLabel();
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const { character, setCharacter, profession, strategicGame } = context;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const maxRanks = maxRanksPerLevel(strategicGame);
  const cultureRanks = skill.cultureRanks ?? 0;
  const professionSkill = !!profession && (profession.professionalSkills as string[]).includes(skill.skillId);

  const update = (request: Promise<Character>) => request.then(setCharacter).catch(notify.error);

  // Up to 2 ranks per level (3 with the game's allowThirdRank option); the third rank costs the same as the second
  const nextCost = skill.development[Math.min(skill.ranksDeveloped, skill.development.length - 1, 1)];
  const canLevelUp =
    skill.ranksDeveloped < maxRanks &&
    nextCost !== undefined &&
    spendableDevPoints(character, strategicGame) >= nextCost;
  // Culture ranks cannot be removed
  const canLevelDown = skill.ranksDeveloped >= 1 && skill.ranks - 1 >= cultureRanks;
  const canDelete = skill.skillId !== 'body-development' && skill.ranks <= skill.ranksDeveloped;

  const toggle = (type: ProfessionalType) => {
    const types = (skill.professional ?? []).includes(type)
      ? (skill.professional ?? []).filter((value) => value !== type)
      : [...(skill.professional ?? []), type];
    update(setUpProfessionalSkill(character.id, skill.skillId, skill.specialization, types, auth));
  };

  const mark = (type: ProfessionalType) => {
    const on = !!skill.professional?.includes(type);
    // A skill of another profession may still carry a mark: shown, not editable
    const editable = professionSkill && (on || context.marked[type] < context.limits[type]);
    return { on, editable, shown: on || professionSkill };
  };

  const professionalMark = mark(PROFESSIONAL);
  const knackMark = mark(KNACK);

  const breakdown = [
    { key: 'rank', value: skill.developmentBonus },
    { key: 'stat', value: skill.statBonus },
    { key: 'racial', value: skill.racialBonus },
    { key: 'profession', value: skill.professionalBonus },
    { key: 'trait-bonus', value: skill.traitBonus ?? 0 },
    { key: 'custom', value: skill.customBonus },
  ].filter((item) => item.key === 'rank' || item.value !== 0);

  return (
    <Fragment>
      <TableRow hover sx={{ '& > td': { borderBottom: open ? 0 : undefined } }}>
        <TableCell sx={EXPAND}>
          <IconButton size="small" aria-label={t('toggle-skill-details')} onClick={() => setOpen((value) => !value)}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        {/* On phones there is no expand column: the name opens the details */}
        <TableCell
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            setOpen((value) => !value);
          }}
          tabIndex={0}
          aria-expanded={open}
          sx={{ cursor: 'pointer' }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t(skill.skillId)}
              {skill.specialization && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: { xs: 'block', sm: 'inline' } }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {' · '}
                  </Box>
                  {specializationLabel(skill.specialization)}
                </Typography>
              )}
            </Typography>
            {skill.missingReference && <MissingReferenceChip />}
            {/* On phones the marks are in the menu of the row */}
            <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <MarkToggle
                type={PROFESSIONAL}
                {...professionalMark}
                onToggle={() => toggle(PROFESSIONAL)}
                limit={context.limits.professional}
              />
              <MarkToggle type={KNACK} {...knackMark} onToggle={() => toggle(KNACK)} limit={context.limits.knack} />
            </Stack>
          </Stack>
        </TableCell>
        <TableCell sx={WIDE}>
          <Typography variant="caption" color="text.secondary">
            {skill.statistics.length ? skill.statistics.join('/').toUpperCase() : '—'}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', px: 0.5 }}>
          <RankStepper
            developed={skill.ranksDeveloped}
            max={maxRanks}
            canUp={canLevelUp}
            canDown={canLevelDown}
            onUp={() => update(levelUpSkill(character.id, skill.skillId, skill.specialization, auth))}
            onDown={() => update(levelDownSkill(character.id, skill.skillId, skill.specialization, auth))}
          />
        </TableCell>
        <TableCell align="right" sx={WIDE}>
          {cultureRanks > 0 ? (
            <Tooltip title={t('culture-ranks-breakdown', { culture: cultureRanks, total: skill.ranks })}>
              <span>
                {skill.ranks}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >{` (${cultureRanks})`}</Typography>
              </span>
            </Tooltip>
          ) : (
            skill.ranks
          )}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: skill.totalBonus < 0 ? 'error.main' : 'text.primary' }}>
          {formatBonus(skill.totalBonus)}
        </TableCell>
        <TableCell align="right" sx={{ ...WIDE, whiteSpace: 'nowrap' }}>
          <Typography variant="caption" color="text.secondary">
            {skill.development?.join(' / ') || '—'}
          </Typography>
        </TableCell>
        <TableCell sx={{ px: 0.5 }}>
          <IconButton size="small" aria-label={t('more-actions')} onClick={(event) => setMenu(event.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
            {[
              { type: PROFESSIONAL, state: professionalMark, on: TurnedInIcon, off: TurnedInNotIcon },
              { type: KNACK, state: knackMark, on: StarIcon, off: StarBorderIcon },
            ]
              .filter((item) => item.state.shown)
              .map(({ type, state, on: OnIcon, off: OffIcon }) => (
                <MenuItem
                  key={type}
                  disabled={!state.editable}
                  onClick={() => {
                    setMenu(null);
                    toggle(type);
                  }}
                >
                  <ListItemIcon>
                    {state.on ? <OnIcon fontSize="small" color="primary" /> : <OffIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>{t(type === PROFESSIONAL ? 'professional-skill' : 'knack-skill')}</ListItemText>
                </MenuItem>
              ))}
            <MenuItem
              disabled={!canDelete}
              onClick={() => {
                setMenu(null);
                update(deleteCharacterSkill(character.id, skill.skillId, skill.specialization, auth));
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('delete')}</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={COLUMNS} sx={{ py: 0, ...(open ? {} : { borderBottom: 0 }) }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Stack spacing={0.75} sx={{ py: 1, pl: { md: 5 } }}>
              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, alignItems: 'baseline' }}
              >
                {breakdown.map((item) => (
                  <Typography key={item.key} variant="body2" color="text.secondary">
                    {`${t(item.key)} `}
                    <Box component="span" sx={{ color: bonusColor(item.value), fontWeight: 600 }}>
                      {formatBonus(item.value)}
                    </Box>
                  </Typography>
                ))}
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {`= ${formatBonus(skill.totalBonus)}`}
                </Typography>
              </Stack>
              {/* On phones, the columns that do not fit */}
              <Stack
                direction="row"
                useFlexGap
                sx={{ display: { xs: 'flex', md: 'none' }, flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}
              >
                <Detail label={t('stats')} value={skill.statistics.join('/').toUpperCase() || '—'} />
                <Detail
                  label={t('ranks')}
                  value={cultureRanks > 0 ? `${skill.ranks} (${cultureRanks})` : `${skill.ranks}`}
                />
                <Detail label={t('development-cost')} value={skill.development?.join(' / ') || '—'} />
                <Detail label={t('dev-ranks')} value={`${skill.ranksDeveloped} / ${maxRanks}`} />
              </Stack>
              {cultureRanks > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {t('culture-ranks-breakdown', { culture: cultureRanks, total: skill.ranks })}
                </Typography>
              )}
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

const Detail: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Typography variant="body2" color="text.secondary">
    {`${label} `}
    <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
      {value}
    </Box>
  </Typography>
);

/** Ranks developed in the level between the buttons that remove and add one. */
const RankStepper: FC<{
  developed: number;
  max: number;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
}> = ({ developed, max, canUp, canDown, onUp, onDown }) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <IconButton size="small" color="primary" aria-label={t('skill-rank-remove')} disabled={!canDown} onClick={onDown}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      {/* On phones the squares do not fit: the details of the row show the ranks */}
      <Stack
        direction="row"
        role="img"
        aria-label={t('dev-ranks-value', { developed, max })}
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        {Array.from({ length: max }, (_, index) =>
          index < developed ? (
            <SquareIcon key={index} sx={{ fontSize: 14 }} />
          ) : (
            <CropSquareIcon key={index} sx={{ fontSize: 14, color: 'text.disabled' }} />
          )
        )}
      </Stack>
      <IconButton size="small" color="primary" aria-label={t('skill-rank-add')} disabled={!canUp} onClick={onUp}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

/**
 * Professional or knack mark next to the name: a small toggle on the skills of the profession, disabled when the
 * character already has all of its kind; only the mark on any other marked skill.
 */
const MarkToggle: FC<{
  type: ProfessionalType;
  on: boolean;
  editable: boolean;
  shown: boolean;
  limit: number;
  onToggle: () => void;
}> = ({ type, on, editable, shown, limit, onToggle }) => {
  const { t } = useTranslation();
  if (!shown) return null;
  const label = t(type === 'professional' ? 'professional-skill' : 'knack-skill');
  const Icon = type === 'professional' ? (on ? TurnedInIcon : TurnedInNotIcon) : on ? StarIcon : StarBorderIcon;
  const hint = !editable && !on ? t('professional-mark-limit', { limit }) : label;
  return (
    <Tooltip title={hint}>
      <span>
        <IconButton
          size="small"
          color="primary"
          aria-label={label}
          aria-pressed={on}
          disabled={!editable}
          onClick={(event) => {
            // The name cell opens the details: a mark only toggles itself
            event.stopPropagation();
            onToggle();
          }}
          sx={{ p: 0.25, ...(on ? {} : { opacity: 0.6 }) }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </IconButton>
      </span>
    </Tooltip>
  );
};
