import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import {
  Alert,
  alpha,
  Box,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  AddButton,
  BonusDevPointsSummary,
  Character,
  CharacterSkill,
  Profession,
  SkillGroupList,
  sortSkillsByName,
  StrategicGame,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { MAX_PROFESSIONAL_SKILLS, resolvePowerLevel } from '../../../services/game-rules';
import AddSkillDialog from './AddSkillDialog';
import CharacterFightingStyles from './CharacterFightingStyles';
import CharacterSkillBreakdown from './CharacterSkillBreakdown';
import CharacterSkillTable from './CharacterSkillTable';

const STORAGE_KEY = 'character-display-skill-table';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, profession, strategicGame }) => {
  const { t, i18n } = useTranslation();
  // Spec 050: specializations are catalog keys shown by their name
  const specializationLabel = useSpecializationLabel();
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const [skillNameFilter, setSkillNameFilter] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<CharacterSkill | null>(null);
  const [displaySkillTable, setDisplaySkillTable] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleViewModeChange = (_e: any, val: string | null) => {
    if (val === null) return;
    const table = val === 'table';
    setDisplaySkillTable(table);
    try {
      localStorage.setItem(STORAGE_KEY, table ? 'true' : 'false');
    } catch {
      // localStorage may be unavailable (private mode, blocked storage): keep the in-memory value
    }
  };

  const normalizedFilter = skillNameFilter.trim().toLowerCase();
  // Sorted by the translated name, again when the translations load or the language changes
  const filteredSkills = useMemo(() => {
    const skills = !normalizedFilter
      ? character.skills
      : character.skills.filter((skill) => {
          const skillName = t(skill.skillId).toLowerCase();
          const specialization = specializationLabel(skill.specialization).toLowerCase();
          return skillName.includes(normalizedFilter) || specialization.includes(normalizedFilter);
        });
    return sortSkillsByName(skills, t, i18n.language);
  }, [character.skills, normalizedFilter, t, i18n.language, specializationLabel]);

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 1.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h6" color="primary">
              {t('skills')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('manage-character-skills')}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              rowGap: 1,
            }}
          >
            <TextField
              size="small"
              value={skillNameFilter}
              onChange={(event) => setSkillNameFilter(event.target.value)}
              placeholder={t('search-skill')}
              aria-label={t('filter-skills')}
              sx={{ width: { xs: '100%', sm: 280 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: skillNameFilter ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t('clear')}
                        edge="end"
                        size="small"
                        onClick={() => setSkillNameFilter('')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <AddButton onClick={() => setOpenAddSkillDialog(true)} />
            <ToggleButtonGroup
              value={displaySkillTable ? 'table' : 'list'}
              exclusive
              size="small"
              onChange={handleViewModeChange}
              aria-label={t('view-mode')}
            >
              <ToggleButton value="list" aria-label={t('view-grouped')}>
                <ViewAgendaIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label={t('table')}>
                <TableRowsIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        <DevelopmentPointsProgress
          available={character.experience.availableDevPoints}
          total={character.experience.devPoints}
        />
        <BonusDevPointsSummary
          character={character}
          strategicGame={strategicGame}
          limit={resolvePowerLevel(strategicGame?.powerLevel).raceDevPointsPerLevel}
        />
        <ProfessionalBonusesAlert
          character={character}
          profession={profession}
          strategicGame={strategicGame}
          onShowTable={displaySkillTable ? undefined : () => handleViewModeChange(null, 'table')}
        />
      </Stack>

      {displaySkillTable ? (
        <CharacterSkillTable
          character={character}
          skills={filteredSkills}
          setCharacter={setCharacter}
          profession={profession}
          strategicGame={strategicGame}
        />
      ) : (
        <SkillGroupList skills={filteredSkills} onSelect={setSelectedSkill} searchable={false} />
      )}
      <CharacterFightingStyles character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
      <CharacterSkillBreakdown skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      <AddSkillDialog
        open={openAddSkillDialog}
        strategicGame={strategicGame}
        character={character}
        setCharacter={setCharacter}
        onClose={() => setOpenAddSkillDialog(false)}
      />
    </>
  );
};

/**
 * Professional bonuses still to assign (Core Law 2.4): 10 skills of the profession get the professional bonus and the
 * power level sets the knacks. They are marked with the buttons of the skill table, so the alert offers to open it.
 */
function ProfessionalBonusesAlert({
  character,
  profession,
  strategicGame,
  onShowTable,
}: {
  character: Character;
  profession?: Profession;
  strategicGame?: StrategicGame;
  onShowTable?: () => void;
}) {
  const { t, i18n } = useTranslation();
  if (!profession) return null;
  const count = (type: string) => character.skills.filter((skill) => skill.professional?.includes(type)).length;
  const professional = Math.max(0, MAX_PROFESSIONAL_SKILLS - count('professional'));
  const knacks = Math.max(0, resolvePowerLevel(strategicGame?.powerLevel).knackCount - count('knack'));
  if (professional === 0 && knacks === 0) return null;
  // Only the skills of the profession that the character has can be marked
  const candidates = character.skills.filter((skill) =>
    (profession.professionalSkills as string[]).includes(skill.skillId)
  ).length;
  return (
    <Alert
      severity="info"
      action={
        onShowTable && (
          <Button color="inherit" size="small" onClick={onShowTable}>
            {t('professional-bonuses-assign')}
          </Button>
        )
      }
    >
      {t('professional-bonuses-pending', {
        items: new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format([
          ...(professional > 0 ? [t('professional-bonuses-professional', { count: professional })] : []),
          ...(knacks > 0 ? [t('professional-bonuses-knacks', { count: knacks })] : []),
        ]),
      })}
      {professional > 0 && candidates < MAX_PROFESSIONAL_SKILLS && ` ${t('professional-bonuses-add-skills')}`}
    </Alert>
  );
}

function DevelopmentPointsProgress({ available, total }: { available: number; total: number }) {
  const { t } = useTranslation();
  const safeTotal = Math.max(total, 0);
  const ratio = safeTotal > 0 ? Math.max(0, Math.min(available / safeTotal, 1)) : 0;
  const segments = 12;
  const filledSegments = Math.round(ratio * segments);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 'none' }}>
        {t('dp-available')}: <b>{available}</b> / {total}
      </Typography>
      <Stack
        direction="row"
        spacing={0.25}
        aria-label={t('development-points-progress')}
        sx={{
          width: { xs: '100%', sm: 220 },
          height: 8,
          p: 0.25,
          borderRadius: 999,
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: segments }, (_, index) => (
          <Box
            key={index}
            sx={(theme) => ({
              flex: 1,
              borderRadius: 999,
              bgcolor: index < filledSegments ? theme.palette.success.light : alpha(theme.palette.common.white, 0.06),
              boxShadow: index < filledSegments ? `0 0 8px ${alpha(theme.palette.success.light, 0.35)}` : 'none',
            })}
          />
        ))}
      </Stack>
    </Stack>
  );
}

export default CharacterViewSkills;
