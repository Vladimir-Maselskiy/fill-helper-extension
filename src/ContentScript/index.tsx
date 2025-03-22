import React from 'react';
import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';

try {
  console.debug(`Starting v${browser.runtime.getManifest().version}:`, { url: window.location.href });

  const container = document.createElement('div');
  const root = ReactDOM.createRoot(container);

  root.render(<div />);
} catch (error) {
  console.error('Render error:', error);
}
