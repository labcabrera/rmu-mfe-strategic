import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  CancelButton,
  SaveButton,
  Character,
  Faction,
  StrategicGame,
  updateCharacter,
  UpdateCharacterDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const CharacterUpdateActions: FC<{
  character: Character;
  game: StrategicGame;
  faction: Faction;
  formData: UpdateCharacterDto;
}> = ({ character, game, faction, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('Game'), link: `/strategic/games/view/${game.id}` },
  ];

  const onUpdate = () => {
    updateCharacter(character.id, formData)
      .then((data: Character) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={onCancel} />
      <SaveButton onClick={onUpdate} />
    </RmuBreadcrumbs>
  );
};

export default CharacterUpdateActions;
