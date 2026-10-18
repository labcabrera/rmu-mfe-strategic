import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  Character,
  fetchCharacters,
  ListPage,
  RmuTextCard,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterListFilters from './CharacterListFilters';

export default function CharacterListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [rsql, setRsql] = useState('');
  const query = usePagedQuery<Character>({
    fetcher: (q, page, size) => fetchCharacters(q, page, size, auth),
    rsql,
    onError: notify.error,
  });

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters') },
      ]}
      query={query}
      filters={<CharacterListFilters onChange={setRsql} />}
      renderItem={(character) => (
        <RmuTextCard
          value={character.name}
          subtitle={character.info.race.name}
          image={character.imageUrl || ''}
          onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
        />
      )}
    />
  );
}
