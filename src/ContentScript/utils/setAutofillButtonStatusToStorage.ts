import { TStatus, TTodo } from 'ContentScript/components/Popup/Popup';
import browser from 'webextension-polyfill';
export const setAutofillButtonStatusToStorage = async (status: TStatus) => {
  const currentAutofillStatus = (await browser.runtime.sendMessage({
    type: 'SET_CURRENT_AUTOFILL_BUTTON_STATUS',
    data: status,
  })) as { topButton: TStatus | null; todoes: TTodo[] | null };
  return currentAutofillStatus;
};
