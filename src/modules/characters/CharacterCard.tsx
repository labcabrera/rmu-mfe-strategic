import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Character, defaultImages, EntityCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterHealthChips, { healthChips } from '../shared/chips/CharacterHealthChips';

/** Showcase card of a character (spec 046): race and profession, level, hit points and defensive bonus. */
const CharacterCard: FC<{ character: Character; onClick: () => void }> = ({ character, onClick }) => {
  const { t } = useTranslation();
  return (
    <EntityCard
      title={character.name}
      subtitle={[character.info?.race?.name, t(character.info?.professionId || '')].filter(Boolean).join(' · ')}
      image={character.imageUrl || defaultImages.character}
      fallbackImages={[defaultImages.character]}
      description={character.description}
      chips={
        healthChips(character, t).length > 0 ? (
          <CharacterHealthChips character={character} variant="compact" />
        ) : undefined
      }
      metrics={[
        { label: t('level'), value: character.experience.level },
        { label: t('hp-short'), value: `${character.hp.current}/${character.hp.max}` },
        { label: t('db-short'), value: character.defense.defensiveBonus },
      ]}
      onClick={onClick}
    />
  );
};

export default CharacterCard;
