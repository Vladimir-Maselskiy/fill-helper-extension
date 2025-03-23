import { TStatus, TTodo } from 'ContentScript/components/Popup/Popup';
import browser from 'webextension-polyfill';
export const getCurrentAutofillStatus = async () => {
  const currentAutofillStatus = (await browser.runtime.sendMessage({
    type: 'GET_CURRENT_AUTOFILL_STATUS',
  })) as { topButton: TStatus | null; todoes: TTodo[] | null };
  return currentAutofillStatus;
};
