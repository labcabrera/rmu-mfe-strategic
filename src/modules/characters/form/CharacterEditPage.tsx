/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Character,
  EditableAvatar,
  ErrorState,
  fetchCharacter,
  FormPage,
  LoadingState,
  NotFound,
  TechnicalInfo,
  updateCharacter,
  UpdateCharacterDto,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterEditAttributes from './CharacterEditAttributes';

const toFormData = (character: Character) =>
  ({
    name: character.name || '',
    description: character.description || '',
    info: {
      weight: character.info?.weight || 0,
      height: character.info?.height || 0,
    },
    roleplay: {
      gender: character.roleplay?.gender || '',
      age: character.roleplay?.age || 0,
    },
  }) as UpdateCharacterDto;

/** Edit page of the basic character data. Creation is the CharacterCreatePage wizard. */
export default function CharacterEditPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { characterId } = useParams<{ characterId: string }>();
  const existing = useEntity<Character>(characterId, (id) => fetchCharacter(id, auth), {
    initial: location.state?.character,
    onError: notify.error,
  });
  const character = existing.entity;
  const [formData, setFormData] = useState<UpdateCharacterDto>();
  const [initialData, setInitialData] = useState<string>();

  useEffect(() => {
    if (!character || formData) return;
    const data = toFormData(character);
    setFormData(data);
    setInitialData(JSON.stringify(data));
  }, [character]);

  const onSave = () => {
    updateCharacter(characterId!, formData as Partial<Character>, auth)
      .then((data: Character) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch(notify.error);
  };

  const onCancel = () => navigate(`/strategic/characters/view/${characterId}`, { state: { character } });

  return (
    <FormPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        { name: t('edit') },
      ]}
      onSave={onSave}
      onCancel={onCancel}
      saveDisabled={!formData?.name?.trim()}
      dirty={!!formData && JSON.stringify(formData) !== initialData}
      leftPanel={
        formData && (
          <EditableAvatar
            imageUrl={formData.imageUrl || character?.imageUrl || ''}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            variant="rounded"
          />
        )
      }
    >
      {formData ? (
        <>
          <CharacterEditAttributes formData={formData} setFormData={setFormData} />
          <TechnicalInfo>
            <pre>{`FormData: ${JSON.stringify(formData, null, 2)}`}</pre>
          </TechnicalInfo>
        </>
      ) : existing.notFound ? (
        <NotFound />
      ) : existing.error ? (
        <ErrorState error={existing.error} onRetry={existing.refresh} />
      ) : (
        <LoadingState variant="detail" />
      )}
    </FormPage>
  );
}
