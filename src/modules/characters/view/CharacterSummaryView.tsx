import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Chip } from '@mui/material';
import {
  Character,
  DetailPage,
  EntityState,
  imageBaseUrl,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const defaultCharacterImage = `${imageBaseUrl}images/npcs/unknown.png`;

/**
 * A character seen in summary (spec 071, decision 11): a member of the game outside its faction only gets its name,
 * image, race, profession and level.
 */
const CharacterSummaryView: FC<{ state: EntityState<Character>; strategicGame: StrategicGame | undefined }> = ({
  state,
  strategicGame,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        { name: state.entity?.name ?? t('view') },
      ]}
      entity={state}
      technicalInfo={false}
      hero={(entity) => ({
        title: entity.name,
        overline: `${t('level')} ${entity.experience.level} · ${t(entity.info.professionId)}`,
        image: entity.imageUrl || defaultCharacterImage,
        chips: [
          <Chip key="race" label={t(entity.info.race.name)} />,
          <Chip
            key="faction"
            label={entity.faction.name}
            variant="outlined"
            onClick={() => navigate(`/strategic/factions/view/${entity.faction.id}`)}
          />,
          ...(strategicGame
            ? [
                <Chip
                  key="game"
                  label={strategicGame.name}
                  variant="outlined"
                  onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
                />,
              ]
            : []),
        ],
      })}
    >
      {() => <Alert severity="info">{t('character-summary-help')}</Alert>}
    </DetailPage>
  );
};

export default CharacterSummaryView;
