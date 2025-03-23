import { TTodo } from 'ContentScript/components/Popup/Popup';
import { getElementByXPath } from './getElementByXPath';

export const startAutofilling = (todoes: TTodo[]) => {
  const iFrameRef = getElementByXPath(
    '//iframe[@src="https://todomvc.com/examples/jquery/dist/#/all"]'
  );

  if (iFrameRef && iFrameRef instanceof HTMLIFrameElement) {
    iFrameRef.contentWindow?.postMessage(
      { type: 'START_AUTOFILLING', data: todoes, index: 1 },
      '*'
    );
  }
};
