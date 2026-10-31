import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Badge, Box, Button, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  AddButton,
  addCharacterXP,
  Character,
  LoadingState,
  NumericInput,
  RmuDialog,
  EntityCard,
  Section,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolvePowerLevel } from '../../../services/game-rules';

const gridSizeCard = { xs: 10, sm: 5, md: 5, lg: 3, xl: 2 } as const;
const numberFormat = new Intl.NumberFormat('en-US');

/** XP award ranges per event type, shown as a reference in the add-XP dialog. */
const xpEventGroups = [
  {
    title: 'personal-events',
    events: [
      { label: 'minor-personal-event', min: 10, max: 100 },
      { label: 'moderate-personal-event', min: 100, max: 500 },
      { label: 'major-personal-event', min: 500, max: 1000 },
    ],
  },
  {
    title: 'session-events',
    events: [
      { label: 'minor-session-event', min: 100, max: 500 },
      { label: 'moderate-session-event', min: 500, max: 1000 },
      { label: 'major-session-event', min: 1000, max: 5000 },
    ],
  },
  {
    title: 'story-events',
    events: [
      { label: 'minor-story-event', min: 10, max: 100 },
      { label: 'moderate-story-event', min: 100, max: 500 },
      { label: 'major-story-event', min: 500, max: 1000 },
    ],
  },
];

const CharacterViewExperience: FC<{
  character: Character;
  strategicGame: StrategicGame;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, strategicGame, setCharacter }) => {
  const notify = useNotify();
  const { t } = useTranslation();
  const auth = useAuth();
  const [openAddXpDialog, setOpenAddXpDialog] = useState(false);
  const [baseXp, setBaseXp] = useState<number>();
  const [error, setError] = useState<boolean>(false);
  const experienceMultiplier = strategicGame.options?.experienceMultiplier || 1;
  const totalXp = Math.max(0, Math.round((baseXp || 0) * experienceMultiplier));
  const bonusDevPointsPerLevel = resolvePowerLevel(strategicGame.powerLevel).raceDevPointsPerLevel;

  if (!character) return <LoadingState />;

  function handleClose() {
    setOpenAddXpDialog(false);
    setBaseXp(undefined);
    setError(false);
  }

  function handleAdd() {
    if (!baseXp || baseXp < 1 || totalXp < 1) {
      setError(true);
      return;
    }
    addCharacterXP(character.id, totalXp, auth)
      .then((response) => {
        setCharacter(response);
        handleClose();
      })
      .catch((err) => notify.error(err));
  }

  return (
    <>
      <Section title={t('experience')} actions={<AddButton onClick={() => setOpenAddXpDialog(true)} />}>
        <Grid container spacing={1} columns={10}>
          <Grid size={gridSizeCard}>
            <EntityCard title={`${character.experience.availableLevel}`} subtitle={t('level')} noImage />
          </Grid>
          <Grid size={gridSizeCard}>
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
              invisible={character.experience.availableLevel <= character.experience.level}
              sx={{ display: 'block' }}
            >
              <EntityCard title={`${character.experience.level}`} subtitle={t('current-level')} noImage />
            </Badge>
          </Grid>
          <Grid size={gridSizeCard}>
            <EntityCard title={`${numberFormat.format(character.experience.xp)}`} subtitle={t('xp')} noImage />
          </Grid>
          <Grid size={gridSizeCard}>
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableDevPoints}`}
              invisible={character.experience.availableDevPoints < 1}
              sx={{ display: 'block' }}
            >
              <EntityCard
                title={`${`${character.experience.availableDevPoints} / ${character.experience.devPoints}`}`}
                subtitle={t('dev-points')}
                noImage
              />
            </Badge>
          </Grid>
          <Grid size={gridSizeCard}>
            <EntityCard
              title={`${character.experience.availableBonusDevPoints ?? 0}`}
              subtitle={t('bonus-dev-points')}
              noImage
            />
          </Grid>
          <Grid size={gridSizeCard}>
            <EntityCard
              title={`${`${character.experience.bonusDevPointsSpentThisLevel ?? 0} / ${bonusDevPointsPerLevel}`}`}
              subtitle={t('bonus-dev-points-spent-this-level')}
              noImage
            />
          </Grid>
          {(character.experience.flawDevPoints ?? 0) > 0 && (
            <Grid size={gridSizeCard}>
              <EntityCard title={`${character.experience.flawDevPoints}`} subtitle={t('flaw-dev-points')} noImage />
            </Grid>
          )}
        </Grid>
      </Section>
      <RmuDialog
        open={openAddXpDialog}
        title={t('add-xp')}
        subtitle={`${t('experience-multiplier')}: x${experienceMultiplier}`}
        buttons={[
          <Button variant="contained" onClick={handleClose}>
            {t('close')}
          </Button>,
          <Button
            variant="contained"
            onClick={handleAdd}
            color="success"
            disabled={!baseXp || baseXp < 1 || totalXp < 1}
          >
            {t('add')}
          </Button>,
        ]}
      >
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            {t('xp-award-help')}
          </Typography>
          <Typography variant="body1" color="secondary">
            {t('more-info-in-core-law', { section: '12.4' })}
          </Typography>
          {xpEventGroups.map((group) => (
            <Paper key={group.title} elevation={-2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t(group.title)}
              </Typography>
              <Stack spacing={1}>
                {group.events.map((event) => (
                  <Typography key={event.label} variant="body1">
                    <strong>{t(event.label)}:</strong> {t('xp-range', { min: event.min, max: event.max })}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          ))}
          <Divider />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Box sx={{ width: { xs: '100%', sm: 180 } }}>
              <NumericInput
                value={baseXp || null}
                onChange={(v) => {
                  setBaseXp(v || undefined);
                  if (v && v > 0) setError(false);
                }}
                integer
                min={1}
                label={t('xp')}
                error={error}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {`x ${experienceMultiplier}`}
            </Typography>
            <Typography variant="h6">{t('xp-value', { value: numberFormat.format(totalXp) })}</Typography>
          </Stack>
          {error && (
            <Typography variant="body2" color="error">
              {t('xp-base-required')}
            </Typography>
          )}
        </Stack>
      </RmuDialog>
    </>
  );
};

export default CharacterViewExperience;
