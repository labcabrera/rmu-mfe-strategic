import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Character,
  CollectionView,
  EmptyState,
  EntityCard,
  gridSizeShowcase,
  LoadingState,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_CHARACTER_IMAGE_PATH } from '../../services/image-service';
import CharacterHealthChips, { healthChips } from '../../shared/chips/CharacterHealthChips';

/** Characters of a faction as showcase cards: race and profession, level, hit points and defensive bonus. */
const FactionViewCharacters: FC<{ characters?: Character[] }> = ({ characters }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!characters) return <LoadingState />;
  if (characters.length === 0) return <EmptyState title={t('no-characters-have-been-created')} />;

  return (
    <CollectionView
      items={characters}
      getKey={(character) => character.id}
      mode="cards"
      config={{ modes: ['cards'], storageKey: 'strategic.faction-characters', cardSize: gridSizeShowcase }}
      renderItem={(character) => (
        <EntityCard
          title={character.name}
          subtitle={[character.info?.race?.name, t(character.info?.professionId || '')].filter(Boolean).join(' · ')}
          image={character.imageUrl || DEFAULT_CHARACTER_IMAGE_PATH}
          imageRatio="square"
          description={character.description}
          chips={healthChips(character, t).length > 0 ? <CharacterHealthChips character={character} /> : undefined}
          metrics={[
            { label: t('level'), value: character.experience.level },
            { label: t('hp-short'), value: `${character.hp.current}/${character.hp.max}` },
            { label: t('db-short'), value: character.defense.defensiveBonus },
          ]}
          onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
        />
      )}
    />
  );
};

export default FactionViewCharacters;
