import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
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
import { useError } from '../../../ErrorContext';

const CharacterUpdateActions: FC<{
  character: Character;
  game: StrategicGame;
  faction: Faction;
  formData: UpdateCharacterDto;
}> = ({ character, game, faction, formData }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { showError } = useError();
  const { t } = useTranslation();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('Game'), link: `/strategic/games/view/${game.id}` },
  ];

  const onUpdate = () => {
    updateCharacter(character.id, formData as Partial<Character>, auth)
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
