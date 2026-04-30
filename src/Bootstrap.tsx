import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import i18next from 'i18next';
import App from './App';
import { imageBaseUrl } from './modules/services/config';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Root element with id "app" not found');
const root = ReactDOM.createRoot(rootElement);

async function loadItemsNamespace(): Promise<void> {
  try {
    const lng = (i18next && (i18next.language || (i18next.options && (i18next.options as any).lng))) || 'en';
    const base = (window as any).i18nBase || (window as any).assetsBaseUrl || imageBaseUrl || '';
    const url = `${base}locales/items_${lng}.json`;

    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return;
    const data = await res.json();

    const has = i18next.hasResourceBundle ? i18next.hasResourceBundle(lng, 'items') : false;
    if (!has) {
      i18next.addResourceBundle(lng, 'items', data, true, true);
    } else {
      Object.keys(data).forEach((k) => i18next.addResource(lng, 'items', k, data[k]));
    }
  } catch (err) {
    // ignore errors when loading optional federated namespace
  }
}

(async function init() {
  await loadItemsNamespace();

  root.render(
    <StrictMode>
      <BrowserRouter basename="/strategic">
        <App />
      </BrowserRouter>
    </StrictMode>
  );
})();
