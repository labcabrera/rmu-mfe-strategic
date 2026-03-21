import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { imageBaseUrl } from './modules/services/config';

// const BASE_REMOTE = `${imageBaseUrl}/locales` as const;
const STORAGE_KEY = 'lang';

function getLangFromLocalStorage(): string {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 'en';
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v || 'en';
  } catch (ex) {
    console.warn('Failed to access localStorage for language preference, defaulting to English', ex);
    return 'en';
  }
}

async function fetchJsonOrNull(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (ex) {
    console.warn('Failed to fetch JSON from', url, ex);
    return null;
  }
}

function remoteUrlsFor(lang: string) {
  return {
    common: `${imageBaseUrl}locales/common_${lang}.json`,
    skills: `${imageBaseUrl}locales/skills_${lang}.json`,
    items: `${imageBaseUrl}locales/traits_${lang}.json`,
  };
}

(async () => {
  const lang = getLangFromLocalStorage();
  const urls = remoteUrlsFor(lang);

  const [commonRemote, skillsRemote, itemsRemote] = await Promise.all([
    fetchJsonOrNull(urls.common),
    fetchJsonOrNull(urls.skills),
    fetchJsonOrNull(urls.items),
  ]);

  const merged: Record<string, any> = {
    ...(commonRemote || {}),
    ...(skillsRemote || {}),
    ...(itemsRemote || {}),
  };

  const resources: Record<string, { translation: Record<string, any> }> = {};
  resources[lang] = { translation: merged };

  if (lang !== 'en') {
    const enUrls = remoteUrlsFor('en');
    const [enCommon, enSkills, enItems] = await Promise.all([
      fetchJsonOrNull(enUrls.common),
      fetchJsonOrNull(enUrls.skills),
      fetchJsonOrNull(enUrls.items),
    ]);
    resources['en'] = {
      translation: { ...(enCommon || {}), ...(enSkills || {}), ...(enItems || {}) },
    };
  } else {
    resources['en'] = resources['en'] || { translation: merged };
  }

  try {
    await i18n.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
  } catch (ex) {
    console.warn('Failed to initialize i18n with remote resources, falling back to defaults', ex);
    try {
      i18n.use(initReactI18next).init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });
    } catch (ignore) {
      console.error('Failed to initialize i18n with remote resources, falling back to defaults', ignore);
    }
  }
})();

export default i18n;
