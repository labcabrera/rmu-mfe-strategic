import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Character,
  CollectionView,
  EmptyState,
  gridSizeShowcase,
  LoadingState,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterCard from '../../characters/CharacterCard';

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
        <CharacterCard
          character={character}
          onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
        />
      )}
    />
  );
};

export default FactionViewCharacters;
