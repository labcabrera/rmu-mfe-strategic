import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityCard, Faction } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../services/image-service';

/** Faction showcase card: image, short description and the available gold, formatted in the user language. */
const FactionCard: FC<{ faction: Faction; subtitle?: string; onClick: () => void }> = ({
  faction,
  subtitle,
  onClick,
}) => {
  const { t, i18n } = useTranslation();
  const numberFormat = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);
  return (
    <EntityCard
      title={faction.name}
      subtitle={subtitle}
      image={faction.imageUrl || DEFAULT_FACTION_IMAGE_PATH}
      description={faction.shortDescription || t('no-description')}
      descriptionLines={3}
      metrics={[
        { label: t('gold'), value: numberFormat.format(faction.management?.availableGold ?? 0) },
      ]}
      onClick={onClick}
    />
  );
};

export default FactionCard;
