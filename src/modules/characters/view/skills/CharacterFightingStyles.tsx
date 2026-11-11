import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import UndoIcon from '@mui/icons-material/UndoOutlined';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  addStyleAbility,
  Character,
  CharacterSkill,
  DataTable,
  EmptyState,
  fetchFightingStyles,
  FightingStyle,
  isFightingStyleSkill,
  Panel,
  removeStyleAbility,
  SectionLabel,
  StrategicGame,
  StyleAbility,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { isGameMaster } from '../../../shared/permissions';

/** Fighting styles of the character (spec 032): ranks of the style skills allocated to the abilities of the style. */
export default function CharacterFightingStyles({
  character,
  setCharacter,
  strategicGame,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const styleSkills = character.skills.filter((s) => isFightingStyleSkill(s.skillId) && !!s.specialization);
  const query = useQuery({
    queryKey: ['fighting-styles'],
    queryFn: () => fetchFightingStyles(auth),
    enabled: styleSkills.length > 0,
    gcTime: 0,
    // A catalog: read once while the section is mounted
    staleTime: Infinity,
  });
  const catalog = query.data;

  useEffect(() => {
    if (query.error) notify.error(query.error);
  }, [query.error]);

  if (styleSkills.length === 0) return null;

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      <SectionLabel>{t('fighting-styles')}</SectionLabel>
      {styleSkills.map((skill) => (
        <StyleCard
          key={`${skill.skillId}@${skill.specialization}`}
          skill={skill}
          style={catalog?.styles.find((s) => s.id === skill.specialization && s.skillId === skill.skillId)}
          abilities={catalog?.abilities || []}
          character={character}
          setCharacter={setCharacter}
          canUndo={isGameMaster(auth, strategicGame)}
        />
      ))}
    </Stack>
  );
}

function StyleCard({
  skill,
  style,
  abilities,
  character,
  setCharacter,
  canUndo,
}: {
  skill: CharacterSkill;
  style?: FightingStyle;
  abilities: StyleAbility[];
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  canUndo: boolean;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const selections = skill.styleAbilities || [];
  const freeRanks = skill.styleFreeRanks ?? skill.ranks;

  const add = (abilityId: string) =>
    addStyleAbility(character.id, skill.skillId, skill.specialization!, abilityId, auth)
      .then(setCharacter)
      .catch((error) => notify.error(error));

  const remove = (abilityId: string) =>
    removeStyleAbility(character.id, skill.skillId, skill.specialization!, abilityId, auth)
      .then(setCharacter)
      .catch((error) => notify.error(error));

  // As the server: a required skill (any specialization, or `skill@specialization`) with at least one rank
  const hasSkill = (requirement: string) => {
    const [skillId, specialization] = requirement.split('@');
    return character.skills.some(
      (s) => s.skillId === skillId && (!specialization || s.specialization === specialization) && s.ranks > 0
    );
  };
  const blockedBy = (ability: StyleAbility | undefined, cost: number, times: number): string | null => {
    if (!ability) return t('loading');
    if (times > 0 && (!ability.repeatable || (ability.maxTimes !== null && times >= ability.maxTimes))) {
      return t('style-ability-max-times');
    }
    if (freeRanks < cost) return t('style-ability-no-ranks');
    const missing = ability.requiresAbilities.find((id) => !selections.some((s) => s.abilityId === id));
    if (missing) return t('style-ability-requires', { ability: t(`style-ability-${missing}`) });
    const missingSkill = [...(style?.requiresSkills ?? []), ...ability.requiresSkills].find((id) => !hasSkill(id));
    if (missingSkill) return t('style-ability-requires', { ability: t(missingSkill.split('@')[0]) });
    const missingTrait = [...(style?.requiresTraits ?? []), ...ability.requiresTraits].find(
      (id) => !character.traits?.some((trait) => trait.traitId === id)
    );
    if (missingTrait) return t('style-ability-requires', { ability: t(missingTrait) });
    return null;
  };

  const timesOf = (abilityId: string) => selections.find((s) => s.abilityId === abilityId)?.times ?? 0;

  return (
    <Panel variant="outlined">
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t(skill.specialization!)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(skill.skillId)}
        </Typography>
        <Chip size="small" label={t('style-ranks', { ranks: skill.ranks })} />
        <Tooltip title={t('style-free-ranks-help')}>
          <Chip
            size="small"
            color={freeRanks > 0 ? 'success' : 'default'}
            label={t('style-free-ranks-chip', { ranks: freeRanks, bonus: skill.styleFreeRanksBonus ?? 0 })}
          />
        </Tooltip>
      </Stack>
      {!style ? (
        <EmptyState dense title={t('fighting-style-not-found')} />
      ) : (
        <DataTable
          rows={style.abilities}
          getKey={(entry) => entry.abilityId}
          columns={[
            { key: 'ability', header: t('style-ability'), render: (entry) => t(`style-ability-${entry.abilityId}`) },
            { key: 'cost', header: t('cost'), align: 'right', render: (entry) => entry.cost },
            {
              key: 'selected',
              header: t('selected'),
              align: 'right',
              render: (entry) => {
                const times = timesOf(entry.abilityId);
                return times > 0 ? `×${times}` : '-';
              },
            },
            {
              key: 'actions',
              header: t('actions'),
              align: 'right',
              cellSx: { whiteSpace: 'nowrap' },
              render: (entry) => {
                const times = timesOf(entry.abilityId);
                const blocked = blockedBy(
                  abilities.find((a) => a.id === entry.abilityId),
                  entry.cost,
                  times
                );
                return (
                  <>
                    <Tooltip title={blocked ?? t('style-ability-add')}>
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label={t('style-ability-add')}
                          disabled={!!blocked}
                          onClick={() => add(entry.abilityId)}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {canUndo && times > 0 && (
                      <Tooltip title={t('style-ability-undo')}>
                        <IconButton
                          size="small"
                          color="warning"
                          aria-label={t('style-ability-undo')}
                          onClick={() => remove(entry.abilityId)}
                        >
                          <UndoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                );
              },
            },
          ]}
        />
      )}
    </Panel>
  );
}
