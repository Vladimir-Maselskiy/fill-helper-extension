import React from 'react';
import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';
import { Popup } from './components/Popup/Popup';
import { StyleSheetManager } from 'styled-components';

try {
  console.debug(`Starting v${browser.runtime.getManifest().version}:`, {
    url: window.location.href,
  });

  const container = document.createElement('div');
  container.id = 'starter-extension-root';
  document.body.appendChild(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });
  const reactRoot = document.createElement('div');
  shadowRoot.appendChild(reactRoot);
  const root = ReactDOM.createRoot(reactRoot);

  const styleTag = document.createElement('style');
  shadowRoot.appendChild(styleTag);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/antd/4.18.5/antd.min.css'; // Підключаємо CDN для стилів antd
  shadowRoot.appendChild(link);

  root.render(
    <StyleSheetManager target={styleTag}>
      <Popup />
    </StyleSheetManager>
  );
} catch (error) {
  console.error('Render error:', error);
}
