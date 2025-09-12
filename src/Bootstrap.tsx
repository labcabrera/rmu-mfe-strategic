import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Root element with id "app" not found');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter basename="/strategic">
      <App />
    </BrowserRouter>
  </StrictMode>
);
