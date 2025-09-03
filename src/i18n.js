import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import enItems from './locales/en-items.json';
import enSkills from './locales/en-skills.json';
import en from './locales/en.json';
import es from './locales/es.json';

const enTranslations = {
  ...en,
  ...enItems,
  ...enSkills,
};

const resources = {
  en: { translation: enTranslations },
  es: { translation: es },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
