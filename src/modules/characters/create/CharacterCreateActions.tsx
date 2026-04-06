import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCharacter,
  CreateCharacterDto,
  Faction,
  RmuBreadcrumbs,
  SaveButton,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const CharacterCreateActions: FC<{
  formData: CreateCharacterDto;
  game?: StrategicGame;
  faction?: Faction;
  isValid: boolean;
}> = ({ formData, game, faction, isValid }) => {
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
    createCharacter(formData)
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
