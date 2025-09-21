import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../api/language.dto';
import CardListItem from './CardListItem';

const LanguageCard: FC<{
  language: Language;
}> = ({ language }) => {
  const navigate = useNavigate();

  const handleLanguageClick = () => {
    navigate(`/core/languages/view/${language.id}`, { state: { language } });
  };

  const getSubtitle = () => {
    return language.realmName;
  };

  if (!language) return <p>Loading...</p>;

  return <CardListItem title={language.name} subtitle={getSubtitle()} image="/static/images/generic/language.png" onClick={handleLanguageClick} />;
};

export default LanguageCard;
