import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { Trait } from '../../api/trait.dto';
import CardListItem from './CardListItem';

const TraitCard: FC<{
  trait: Trait;
}> = ({ trait }) => {
  const navigate = useNavigate();

  const handleTraitClick = () => {
    navigate(`/core/traits/view/${trait.id}`, { state: { trait } });
  };

  const getImage = () => {
    if (trait.category === 'combat') return '/static/images/generic/trait-combat.png';
    if (trait.category === 'magical') return '/static/images/generic/trait-magical.png';
    if (trait.category === 'senses') return '/static/images/generic/trait-senses.png';
    if (trait.category === 'discipline') return '/static/images/generic/trait-discipline.png';
    if (trait.category === 'racial') return '/static/images/generic/trait-racial.png';
    if (trait.category === 'physical') return '/static/images/generic/trait-physical.png';
    return '/static/images/generic/trait.png';
  };

  const getSubtitle = () => {
    return `${t(trait.isTalent ? t('trait') : t('flaw'))} - ${t(trait.category)}`;
  };

  if (!trait) return <p>Loading...</p>;

  return <CardListItem title={trait.name} subtitle={getSubtitle()} image={getImage()} onClick={handleTraitClick} />;
};

export default TraitCard;
