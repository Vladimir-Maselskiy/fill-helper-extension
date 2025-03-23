import { getElementByXPath } from './getElementByXPath';

export const initializeIframe = () => {
  observeForElement({
    xPath: '//input',
  });
  addMessageListener();
};

function observeForElement({ xPath }: { xPath: string }): Promise<Node | null> {
  const targetElement = getElementByXPath(xPath);
  if (targetElement) {
    sendMessageToTopFrame({ type: 'INPUT_FOUND', data: '12346' });

    return Promise.resolve(targetElement);
  }
  return new Promise(resolve => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log('mutation', mutation);
          const targetElement = getElementByXPath(xPath);

          if (targetElement) {
            sendMessageToTopFrame({ type: 'INPUT_FOUND' });
            resolve(targetElement);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function sendMessageToTopFrame({ type }: { type: string; data?: any }) {
  if (window?.top) window.top.postMessage({ type }, '*');
}

function addMessageListener() {
  window.addEventListener('message', event => {
    if (event.data.type === 'START_AUTOFILLING') {
      console.log('START_AUTOFILLING', event.data);
    }
  });
}
