import { TStatus, TTodo } from 'ContentScript/components/Popup/Popup';
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

browser.runtime.onMessage.addListener(
  (message: { type: string; data?: any }, sender, response) => {
    const { type, data } = message;

    if (type === 'GET_CURRENT_AUTOFILL_STATUS') {
      getCurrentAutofillStatus().then(resp => response(resp));
    } else if (type === 'SET_CURRENT_AUTOFILL_BUTTON_STATUS') {
      setCurrentAutofillButtonStatus(data as TStatus).then(resp =>
        response(resp)
      );
    } else if (type === 'SET_CURRENT_TODOES_STATUS') {
      setCurrentTodoesStatus(data as TTodo[]).then(resp => response(resp));
    }
    return true;
  }
);

async function getCurrentAutofillStatus() {
  const topButton = (await getFromLocalstorage('topButton')) || null;
  const todoes = (await getFromLocalstorage('todoes')) || null;
  return { topButton, todoes };
}

async function setCurrentAutofillButtonStatus(status: TStatus) {
  await setToLocalstorage({ topButton: status });
  const currentAutofillStatus = await getCurrentAutofillStatus();
  return currentAutofillStatus;
}
async function setCurrentTodoesStatus(todoes: TTodo[]) {
  await setToLocalstorage({ todoes });
  const currentAutofillStatus = await getCurrentAutofillStatus();
  return currentAutofillStatus;
}

async function getFromLocalstorage(key: string) {
  const result = await browser.storage.local.get(key);
  return result[key];
}

async function setToLocalstorage(data: { [key: string]: any }) {
  await browser.storage.local.set(data);
}
