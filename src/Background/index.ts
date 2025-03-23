import browser from 'webextension-polyfill';

const action = browser.action || browser.browserAction;

action.onClicked.addListener(async tab => {
  console.debug('Clicked extension icon:', { tab });
});

action.onClicked.addListener(tab => {
  const { id } = tab;
  if (!id) {
    return;
  }
  browser.tabs.update(id, {
    url: 'https://simplifyjobs.github.io/extension-take-home/',
  });
});
