import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import {
  Alert,
  alpha,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
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
  RuleHint,
  SearchField,
  SectionLabel,
  SkillGroupList,
  sortSkillsByName,
  StrategicGame,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  intenseTrainingLimit,
  MAX_PROFESSIONAL_SKILLS,
  MAX_RANKS_PER_LEVEL,
  resolveOptions,
  resolvePowerLevel,
  spendableBonusDevPoints,
} from '../../../services/game-rules';
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
  // Spec 076, A3: the ranks of the table may spend the bonus points before the normal ones
  const [bonusFirst, setBonusFirst] = useState(false);
  const canSpendBonus = spendableBonusDevPoints(character, strategicGame) > 0;
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
            <SectionLabel>{t('skills')}</SectionLabel>
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
            <Box sx={{ width: { xs: '100%', sm: 280 } }}>
              <SearchField
                size="small"
                label={t('filter-skills')}
                placeholder={t('search-skill')}
                value={skillNameFilter}
                onChange={setSkillNameFilter}
                delay={0}
              />
            </Box>
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
        {displaySkillTable && (
          <RankRules
            character={character}
            strategicGame={strategicGame}
            bonusFirst={canSpendBonus ? bonusFirst : undefined}
            onBonusFirstChange={setBonusFirst}
          />
        )}
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
          pool={canSpendBonus && bonusFirst ? 'bonus' : 'auto'}
        />
      ) : (
        <SkillGroupList skills={filteredSkills} onSelect={setSelectedSkill} searchable={false} />
      )}
      <CharacterFightingStyles character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
      <CharacterSkillBreakdown skill={selectedSkill} traits={character.traits} onClose={() => setSelectedSkill(null)} />
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
 * The ranks a skill can take in a level (Core Law §3, workspace spec 076) as a rule hint and, while the character has
 * bonus points to spend in the level, the switch that spends them first (A3). `bonusFirst` undefined hides it.
 */
function RankRules({
  character,
  strategicGame,
  bonusFirst,
  onBonusFirstChange,
}: {
  character: Character;
  strategicGame?: StrategicGame;
  bonusFirst?: boolean;
  onBonusFirstChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const specializationLabel = useSpecializationLabel();
  const intenseTraining = resolveOptions(strategicGame?.options).intenseTraining;
  const marked = character.experience.intenseTrainingSkill;
  const markedName = marked
    ? [t(marked.skillId), marked.specialization && specializationLabel(marked.specialization)]
        .filter(Boolean)
        .join(' · ')
    : '';
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <RuleHint
        title={t('ranks-per-level')}
        description={t(intenseTraining ? 'ranks-per-level-intense-training-help' : 'ranks-per-level-help')}
        params={{
          'max-ranks': MAX_RANKS_PER_LEVEL,
          ...(intenseTraining ? { 'intense-training-limit': intenseTrainingLimit(character.experience.level) } : {}),
        }}
        reference="Core Law §3"
      >
        <Typography variant="body2" color="text.secondary">
          {t('ranks-per-level')}
          {': '}
          <b>{intenseTraining ? t('ranks-per-level-intense-training') : MAX_RANKS_PER_LEVEL}</b>
          {intenseTraining && marked && ` · ${t('intense-training-skill', { skill: markedName })}`}
        </Typography>
      </RuleHint>
      {bonusFirst !== undefined && (
        <FormControlLabel
          sx={{ ml: { sm: 'auto' } }}
          control={
            <Switch size="small" checked={bonusFirst} onChange={(event) => onBonusFirstChange(event.target.checked)} />
          }
          label={<Typography variant="body2">{t('use-bonus-dev-points-first')}</Typography>}
        />
      )}
    </Stack>
  );
}

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
          borderRadius: (theme) => `${theme.radius.pill}px`,
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: segments }, (_, index) => (
          <Box
            key={index}
            sx={(theme) => ({
              flex: 1,
              borderRadius: `${theme.radius.pill}px`,
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
