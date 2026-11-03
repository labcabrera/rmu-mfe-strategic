import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, Typography } from '@mui/material';
import { EntityCard, Faction, factionPlayerNames } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../services/image-service';

/** Names shown on the card before "and N more". */
const SHOWN_PLAYERS = 3;

/**
 * Faction showcase card: image, the names of its players (spec 072, decision 15) and the available gold, formatted in
 * the user language. The short description stays in the faction view.
 */
const FactionCard: FC<{ faction: Faction; subtitle?: string; onClick: () => void }> = ({
  faction,
  subtitle,
  onClick,
}) => {
  const { t, i18n } = useTranslation();
  const numberFormat = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);
  const names = factionPlayerNames(faction);
  const shown = names.slice(0, SHOWN_PLAYERS).join(', ');
  const rest = names.length - SHOWN_PLAYERS;
  const description =
    names.length === 0 ? (
      <Typography component="span" variant="body2" color="text.disabled">
        {t('faction-players-none')}
      </Typography>
    ) : (
      <Tooltip title={names.join(', ')}>
        <span>{rest > 0 ? t('faction-players-and-more', { names: shown, count: rest }) : shown}</span>
      </Tooltip>
    );
  return (
    <EntityCard
      title={faction.name}
      subtitle={subtitle}
      image={faction.imageUrl || DEFAULT_FACTION_IMAGE_PATH}
      description={description}
      descriptionLines={3}
      metrics={[{ label: t('gold'), value: numberFormat.format(faction.management?.availableGold ?? 0) }]}
      onClick={onClick}
    />
  );
};

export default FactionCard;
