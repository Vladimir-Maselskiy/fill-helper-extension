import browser from 'webextension-polyfill';

export const clearLocalStorage = () => {
  browser.runtime.sendMessage({ type: 'CLEAR_LOCAL_STORAGE' });
};
