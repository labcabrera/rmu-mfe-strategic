import React, { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SquareIcon from '@mui/icons-material/Square';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import {
  Box,
  ButtonGroup,
  Collapse,
  IconButton,
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
  DeleteButton,
  deleteCharacterSkill,
  levelDownSkill,
  levelUpSkill,
  Profession,
  setUpProfessionalSkill,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const maxProfessionalSkills = 10;
const maxKnackSkills = 2;

export default function CharacterSkillTable({
  character,
  skills,
  setCharacter,
  profession,
}: {
  character: Character;
  skills?: CharacterSkill[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
}) {
  const { t } = useTranslation();
  const displayedSkills = skills ?? character.skills;
  const currentKnackSkills = character.skills.filter((s) => s.professional?.includes('knack')).length;
  const currentProfessionalSkills = character.skills.filter((s) => s.professional?.includes('professional')).length;

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ width: 44 }} />
            <TableCell align="left" sx={{ minWidth: 180 }}>
              {t('skill')}
            </TableCell>
            <TableCell align="left" sx={{ minWidth: 120 }}>
              <Tooltip title={t('specialization')}>
                <Typography variant="body2">
                  <b>{t('spec')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="left" sx={{ minWidth: 90 }}>
              {t('stats')}
            </TableCell>

            <TableCell align="right" sx={{ width: 64 }}>
              <Tooltip title={t('developed-ranks')}>
                <Typography variant="body2">
                  <b>{t('ranks')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right" sx={{ width: 72 }}>
              {t('total')}
            </TableCell>
            <TableCell align="left" sx={{ minWidth: 88 }}>
              <Tooltip title={t('developed-ranks')}>
                <Typography variant="body2">
                  <b>{t('dev-ranks')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 72 }}>
              <Tooltip title={t('development-cost')}>
                <Typography variant="body2">
                  <b>{t('development-cost-short')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="left" sx={{ minWidth: 220 }}>
              {t('actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedSkills.map((item, index) => (
            <SkillRow
              key={index}
              skill={item}
              character={character}
              setCharacter={setCharacter}
              profession={profession}
              currentKnackSkills={currentKnackSkills}
              currentProfessionalSkills={currentProfessionalSkills}
            />
          ))}
          {displayedSkills.length === 0 && (
            <TableRow>
              <TableCell colSpan={9}>
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

function SkillRow({
  character,
  setCharacter,
  skill,
  profession,
  currentKnackSkills,
  currentProfessionalSkills,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  skill: CharacterSkill;
  profession?: Profession;
  currentKnackSkills: number;
  currentProfessionalSkills: number;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const isProfessional = skill.professional?.includes('professional');
  const isKnack = skill.professional?.includes('knack');

  const handleLevelUp = () => {
    levelUpSkill(character.id, skill.skillId, skill.specialization, auth)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => notify.error(error));
  };

  const handleLevelDown = () => {
    levelDownSkill(character.id, skill.skillId, skill.specialization, auth)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => notify.error(error));
  };

  const handleSetUpProfessionalSkill = (skillObj: CharacterSkill) => {
    const array = skillObj.professional || [];
    if (array.includes('professional')) {
      //remove
      const index = array.indexOf('professional');
      if (index > -1) {
        array.splice(index, 1);
      }
    } else {
      //add
      array.push('professional');
    }
    setUpProfessionalSkill(character.id, skillObj.skillId, skillObj.specialization, array, auth)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => notify.error(error));
  };

  const handleSetUpKnackSkill = (skillObj: CharacterSkill) => {
    const array = skillObj.professional || [];
    if (array.includes('knack')) {
      //remove
      const index = array.indexOf('knack');
      if (index > -1) {
        array.splice(index, 1);
      }
    } else {
      //add
      array.push('knack');
    }
    setUpProfessionalSkill(character.id, skillObj.skillId, skillObj.specialization, array, auth)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => notify.error(error));
  };

  const handleDeleteSkill = (skill: CharacterSkill) => {
    deleteCharacterSkill(character.id, skill.skillId, skill.specialization, auth)
      .then((updated) => setCharacter(updated))
      .catch((error) => notify.error(error));
  };

  const isLevelUpDisabled = () => {
    //TODO read allow 3rd rank from game settings
    const rank = Math.min(skill.ranksDeveloped, 1);
    const cost = skill.development[rank];
    return character.experience.availableDevPoints < cost || skill.ranksDeveloped > 2;
  };

  const isLevelDownDisabled = () => {
    return skill.ranksDeveloped < 1;
  };

  const isDeletedDisabled = () => {
    if (skill.skillId === 'body-development') return true;
    return skill.ranks > skill.ranksDeveloped;
  };

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const isAvailableProfessionSkill = (skillObj: CharacterSkill) => {
    return !!profession && (profession.professionalSkills as string[]).includes(skillObj.skillId);
  };

  const getStatistics = (skill: CharacterSkill) => {
    return skill.statistics && skill.statistics.length > 0 ? skill.statistics.join('/').toLowerCase() : '-';
  };

  const detailItems = [
    { label: t('rank'), value: skill.developmentBonus, color: getColor(skill.developmentBonus) },
    { label: t('stat'), value: skill.statBonus, color: getColor(skill.statBonus) },
    { label: t('racial'), value: skill.racialBonus, color: getColor(skill.racialBonus) },
    { label: t('profession'), value: skill.professionalBonus, color: getColor(skill.professionalBonus) },
    {
      label: t('custom'),
      value: skill.customBonus,
      color: skill.customBonus === 0 ? 'text.primary' : skill.customBonus > 0 ? 'success.main' : 'error.main',
    },
    {
      label: t('dev-ranks'),
      value: '',
      color: 'text.primary',
    },
  ];

  return (
    <Fragment>
      <TableRow>
        <TableCell align="left" sx={{ width: 44, px: 0.5 }}>
          <IconButton
            aria-label={t('toggle-skill-details')}
            onClick={() => setOpen((current) => !current)}
            size="small"
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {t(skill.skillId)}
        </TableCell>
        <TableCell component="th" scope="row">
          {skill.specialization ? t(skill.specialization) : '-'}
        </TableCell>
        <TableCell align="left">{getStatistics(skill)}</TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            <b>{skill.ranks}</b>
          </Typography>
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getColor(skill.totalBonus),
            fontWeight: 'bold',
          }}
        >
          {skill.totalBonus}
        </TableCell>
        <TableCell align="left">
          <Stack direction="row" spacing={0}>
            {Array.from({ length: 3 }, (_, idx) => idx + 1).map((rank) => (
              <Box key={rank} component="span" sx={{ display: 'inline-flex', mx: 0, p: 0 }}>
                {rank <= skill.ranksDeveloped ? (
                  <SquareIcon sx={{ mx: 0, p: 0 }} fontSize="small" />
                ) : (
                  <CropSquareIcon sx={{ mx: 0, p: 0 }} fontSize="small" />
                )}
              </Box>
            ))}
          </Stack>
        </TableCell>
        <TableCell align="right">{skill.development?.join(' / ') || '-'}</TableCell>
        <TableCell align="left">
          <ButtonGroup>
            <IconButton onClick={handleLevelUp} disabled={isLevelUpDisabled()} color="primary">
              <ArrowCircleUpIcon />
            </IconButton>
            <IconButton onClick={handleLevelDown} disabled={isLevelDownDisabled()} color="primary">
              <ArrowCircleDownIcon />
            </IconButton>
            <DeleteButton onClick={() => handleDeleteSkill(skill)} disabled={isDeletedDisabled()} />
            {isAvailableProfessionSkill(skill) && (
              <>
                <Tooltip title={t('professional-skill')}>
                  <IconButton
                    aria-label={t('professional-skill')}
                    onClick={() => handleSetUpProfessionalSkill(skill)}
                    disabled={!isProfessional && currentProfessionalSkills >= maxProfessionalSkills}
                    color="primary"
                  >
                    {isProfessional ? <TurnedInIcon /> : <TurnedInNotIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('knack-skill')}>
                  <IconButton
                    aria-label={t('knack-skill')}
                    onClick={() => handleSetUpKnackSkill(skill)}
                    color="primary"
                    disabled={!isKnack && currentKnackSkills >= maxKnackSkills}
                  >
                    {isKnack ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Tooltip>
              </>
            )}
          </ButtonGroup>
        </TableCell>
      </TableRow>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell colSpan={9} sx={{ py: 0, borderBottom: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Stack spacing={1} sx={{ py: 1.5 }}>
              {detailItems
                .filter((item) => item.label !== t('dev-ranks'))
                .map((item) => (
                  <Stack key={item.label} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Box sx={{ color: item.color, fontWeight: 500 }}>{item.value}</Box>
                  </Stack>
                ))}
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
