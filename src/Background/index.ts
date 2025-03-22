import browser from 'webextension-polyfill';

const action = browser.action || browser.browserAction;

action.onClicked.addListener(async (tab) => {
  console.debug('Clicked extension icon:', { tab });
});
