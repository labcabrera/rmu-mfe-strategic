import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, CardContent, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import {
  Character,
  EditableAvatar,
  Faction,
  Profession,
  Race,
  RmuTextCard,
  StrategicGame,
  updateCharacter,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';

const defaultCharacterImage = `${imageBaseUrl}images/npcs/unknown.png`;
const grayscale = 0.7;

export default function CharacterViewResume({
  character,
  race,
  profession,
  strategicGame,
  faction,
  setCharacter,
}: {
  character: Character;
  race?: Race;
  profession?: Profession;
  strategicGame?: StrategicGame;
  faction?: Faction;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const hpPercent = (character.hp.current / character.hp.max) * 100;
  const levelStr =
    character.experience.level < character.experience.availableLevel
      ? `${character.experience.level} / ${character.experience.availableLevel}`
      : `${character.experience.availableLevel}`;
  //TODO
  const nextLevelXp = 1000000;
  const armor = character.defense.armor;
  const armorType = armor.at ? `${armor.at}` : `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;

  const onImageUpdated = (imageId: string) => {
    const dto = { imageUrl: imageId };
    updateCharacter(character.id, dto, auth)
      .then((character) => setCharacter(character))
      .catch((error) => showError(error.message));
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      {character.experience.availableStatLevelUp > 0 && (
        <Typography variant="body1" color="success" sx={{ mt: 2 }}>
          {`${character.experience.availableStatLevelUp} stats updates`}
        </Typography>
      )}
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {character.description}
      </Typography>
      <Box
        sx={{
          // width: 280,
          // minWidth: 280,
          // height: '100%',
          p: 1,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <EditableAvatar
          imageUrl={character.imageUrl || defaultCharacterImage}
          onImageChange={onImageUpdated}
          images={getAvatarImages()}
          variant="rounded"
        />

        <Stack spacing={2}>
          <Stack spacing={1.5} sx={{ alignItems: 'left' }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5">{character.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {t('level')} {character.experience.availableLevel}
              </Typography>
            </Box>
          </Stack>

          <RmuTextCard
            value={levelStr}
            subtitle={t('level')}
            image={`${imageBaseUrl}images/generic/experience.png`}
            grayscale={grayscale}
          />

          <RmuTextCard
            value={race ? t(race.name) : '...'}
            subtitle={t('race')}
            image={race?.imageUrl || '...'}
            grayscale={grayscale}
            onClick={() => navigate(`/core/races/view/${race?.id}`)}
          />

          <RmuTextCard
            value={profession ? t(profession.id) : '...'}
            subtitle={t('profession')}
            image={profession?.imageUrl || '...'}
            grayscale={grayscale}
            onClick={() => navigate(`/core/professions/view/${profession?.id}`)}
          />

          <RmuTextCard
            value={strategicGame?.name || '...'}
            subtitle={t('strategic-game')}
            image={strategicGame?.imageUrl || '...'}
            grayscale={grayscale}
            onClick={() => navigate(`/strategic/games/view/${strategicGame?.id}`)}
          />

          <RmuTextCard
            value={faction?.name || '...'}
            subtitle={t('faction')}
            image={faction?.imageUrl || 'loading...'}
            grayscale={grayscale}
            onClick={() => navigate(`/strategic/factions/view/${faction?.id}`)}
          />

          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <AutoFixHighIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('dev-points')}
                    </Typography>
                    <Typography
                      variant="h6"
                      color={character.experience.availableDevPoints > 0 ? 'success' : undefined}
                    >
                      {character.experience.availableDevPoints} / {character.experience.devPoints}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <MetricProgress
                  icon={<AccessTimeIcon />}
                  label={t('experience')}
                  value={`${character.experience.xp.toLocaleString()} XP`}
                  progress={50}
                  color="primary"
                />

                <Divider />

                <MetricProgress
                  icon={<FavoriteBorderIcon />}
                  label={t('hit-points')}
                  value={`${character.hp.current} / ${character.hp.max}`}
                  progress={hpPercent}
                  color="success"
                />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {t('resume')}
              </Typography>

              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                <SummaryRow label={t('height')} value={`${character.info.height}'`} />
                <SummaryRow label={t('weight')} value={`${character.info.weight} lbs`} />
                <SummaryRow
                  label={t('initiative')}
                  value={character.initiative.totalBonus}
                  danger={character.initiative.totalBonus < 0}
                />
                <SummaryRow label="BMR" value={`${character.movement.baseMovementRate}' /rnd`} />
                <SummaryRow
                  label={t('maneuver-penalty')}
                  value={character.equipment.maneuverPenalty}
                  danger={character.equipment.maneuverPenalty < 0}
                />
                <SummaryRow label={t('armor')} value={armorType} />
                <SummaryRow
                  label={t('db')}
                  value={character.defense.defensiveBonus}
                  danger={character.defense.defensiveBonus < 1}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

function MetricProgress({
  icon,
  label,
  value,
  subValue,
  progress,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  progress: number;
  color: 'primary' | 'success' | 'error';
}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="body2" color="text.secondary">
              {subValue}
            </Typography>
          )}
        </Box>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(progress, 100)}
        color={color}
        sx={{ height: 7, borderRadius: 99 }}
      />
    </Stack>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  extra,
  danger,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  extra?: string;
  danger?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      {icon && <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>}
      <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography variant="body1" color={danger ? 'error' : undefined} sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      {extra && (
        <Typography variant="caption" color="text.secondary">
          ({extra})
        </Typography>
      )}
    </Stack>
  );
}
