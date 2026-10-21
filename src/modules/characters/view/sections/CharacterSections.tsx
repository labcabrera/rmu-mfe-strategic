import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack } from '@mui/material';
import {
  AttackCard,
  Character,
  formatBonus,
  Panel,
  ResistanceList,
  StatBlock,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterViewMovement from '../CharacterViewMovement';
import CharacterHealingPanel from '../healing/CharacterHealingPanel';
import CharacterEquipmentButtons from '../items/CharacterEquipmentButtons';
import CharacterEquipmentPanel from '../items/CharacterEquipmentPanel';
import CharacterViewStats from '../stats/CharacterViewStats';
import CharacterViewTraits from '../traits/CharacterViewTraits';
import CharacterViewExperience from '../xp/CharacterViewXp';
import { Bento, DefensePanel, formatFumble, formatMeleeRange, LoadPanel, Row, span } from './CharacterPanels';

export const characterSectionIds = ['overview', 'attributes', 'skills', 'combat', 'equipment', 'progression'] as const;
export type CharacterSectionId = (typeof characterSectionIds)[number];

type SectionProps = {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
};

const TOP_SKILLS = 6;

/** Dashboard of the whole sheet: every card links to the section with the full data. */
export const CharacterOverview = ({
  character,
  strategicGame,
  go,
}: Omit<SectionProps, 'setCharacter'> & { go: (id: CharacterSectionId) => void }) => {
  const { t } = useTranslation();
  const seeAll = (id: CharacterSectionId) => ({ label: t('see-all'), onClick: () => go(id) });
  const topSkills = [...character.skills].sort((a, b) => b.totalBonus - a.totalBonus).slice(0, TOP_SKILLS);
  return (
    <Bento>
      <Box sx={span(12, 8)}>
        <Panel title={t('statistics')} action={seeAll('attributes')}>
          <StatBlock statistics={character.statistics} />
        </Panel>
      </Box>
      <Box sx={span(6, 4)}>
        <Panel title={t('resistances')} action={seeAll('attributes')}>
          <ResistanceList resistances={character.resistances} />
        </Panel>
      </Box>
      <Box sx={span(6, 4, 3)}>
        <Panel title={t('defense')} action={seeAll('combat')}>
          <DefensePanel character={character} />
        </Panel>
      </Box>
      <Box sx={span(12, 8, 9)}>
        <Panel title={t('attacks')} action={seeAll('combat')}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.5 }}>
            {character.attacks.map((attack) => (
              <AttackCard
                key={`${attack.attackName}-${attack.type}`}
                attack={attack}
                meleeRangeLabel={formatMeleeRange(attack, strategicGame)}
                fumbleLabel={formatFumble(attack)}
                dense
              />
            ))}
          </Box>
        </Panel>
      </Box>
      <Box sx={span(6, 6)}>
        <Panel title={t('top-skills')} action={seeAll('skills')}>
          {topSkills.map((skill) => (
            <Row
              key={skill.id}
              label={skill.specialization ? `${t(skill.skillId)} (${t(skill.specialization)})` : t(skill.skillId)}
              value={formatBonus(skill.totalBonus)}
            />
          ))}
        </Panel>
      </Box>
      <Box sx={span(6, 3)}>
        <Panel title={t('equipment')} action={seeAll('equipment')}>
          <LoadPanel character={character} />
        </Panel>
      </Box>
      <Box sx={span(12, 3)}>
        <Panel title={t('traits')} action={seeAll('attributes')}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {character.traits.map((trait) => (
              <Chip
                key={`${trait.traitId}-${trait.specialization ?? ''}`}
                label={trait.specialization ? `${t(trait.traitName)} (${t(trait.specialization)})` : t(trait.traitName)}
                color={trait.isTalent ? 'primary' : 'default'}
                variant={trait.isTalent ? 'outlined' : 'filled'}
              />
            ))}
          </Stack>
        </Panel>
      </Box>
    </Bento>
  );
};

/** Stats (with their level up), resistances and traits. */
export const CharacterAttributes = ({ character, setCharacter, strategicGame }: SectionProps) => {
  const { t } = useTranslation();
  return (
    <Bento>
      <Box sx={span(12, 8)}>
        <Panel title={t('statistics')}>
          <CharacterViewStats character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
        </Panel>
      </Box>
      <Box sx={span(12, 4)}>
        <Panel title={t('resistances')}>
          <ResistanceList resistances={character.resistances} />
        </Panel>
      </Box>
      <Box sx={span(12, 12)}>
        <CharacterViewTraits character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
      </Box>
    </Bento>
  );
};

/** Attacks, defense, and movement with its pace table. */
export const CharacterCombat = ({ character, strategicGame }: Omit<SectionProps, 'setCharacter'>) => {
  const { t } = useTranslation();
  return (
    <Bento>
      <Box sx={span(12, 8, 9)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          {character.attacks.map((attack) => (
            <AttackCard
              key={`${attack.attackName}-${attack.type}`}
              attack={attack}
              meleeRangeLabel={formatMeleeRange(attack, strategicGame)}
              fumbleLabel={formatFumble(attack)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={span(12, 4, 3)}>
        <Panel title={t('defense')}>
          <DefensePanel character={character} />
        </Panel>
      </Box>
      {strategicGame && (
        <Box sx={span(12, 12)}>
          <Panel title={t('movement')}>
            <CharacterViewMovement character={character} strategicGame={strategicGame} />
          </Panel>
        </Box>
      )}
    </Bento>
  );
};

/** Equipment slots, carried and stored items, and gold. */
export const CharacterEquipment = ({ character, setCharacter }: SectionProps) => (
  <Stack spacing={2}>
    <CharacterEquipmentButtons character={character} setCharacter={setCharacter} />
    <CharacterEquipmentPanel character={character} setCharacter={setCharacter} />
  </Stack>
);

/** Experience and level, then healing and permanent injuries. */
export const CharacterProgression = ({ character, setCharacter, strategicGame }: SectionProps) => (
  <Stack spacing={2}>
    {strategicGame && (
      <CharacterViewExperience character={character} strategicGame={strategicGame} setCharacter={setCharacter} />
    )}
    <CharacterHealingPanel character={character} />
  </Stack>
);
