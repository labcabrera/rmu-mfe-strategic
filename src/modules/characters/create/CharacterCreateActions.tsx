import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  Character,
  createCharacter,
  CreateCharacterDto,
  Faction,
  RmuBreadcrumbs,
  SaveButton,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const CharacterCreateActions: FC<{
  formData: CreateCharacterDto;
  game?: StrategicGame;
  faction?: Faction;
  isValid: boolean;
}> = ({ formData, game, faction, isValid }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();

  if (!game || !faction) return <p>Loading...</p>;

  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('games'), link: '/strategic/games' },
    { name: game.name, link: `/strategic/games/view/${game.id}` },
    { name: faction.name, link: `/strategic/factions/view/${faction.id}` },
    { name: t('Character creation') },
  ];

  const onCreate = async () => {
    const dto = formData as unknown as Partial<Character>;
    createCharacter(dto, auth)
      .then((data) => navigate('/strategic/characters/view/' + data.id, { state: { character: data, game: game } }))
      .catch((err) => showError(err.message));
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <SaveButton onClick={onCreate} disabled={!isValid} />
    </RmuBreadcrumbs>
  );
};

export default CharacterCreateActions;
