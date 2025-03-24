import { TTodo } from 'ContentScript/components/Popup/Popup';
import { getElementByXPath } from './getElementByXPath';
import { get } from 'http';

let inputRef: HTMLInputElement | null = null;

export const initializeIframe = () => {
  observeForElement({
    xPath: '//input',
  });
  addMessageListener();
  addIFrameEventListener();
};

function observeForElement({ xPath }: { xPath: string }): Promise<Node | null> {
  const targetElement = getElementByXPath(xPath);
  if (targetElement) {
    inputRef = targetElement as HTMLInputElement;
    sendMessageToTopFrame({ type: 'INPUT_FOUND' });

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

function sendMessageToTopFrame({ type, data }: { type: string; data?: any }) {
  if (window?.top) window.top.postMessage({ type, data }, '*');
}

function addMessageListener() {
  window.addEventListener('message', async event => {
    const { type, data, index } = event.data as {
      type: string;
      data?: TTodo[];
      index?: number;
    };
    if (type === 'START_AUTOFILLING' && data && index) {
      const currentTodo = data[index];
      await autofillCurrentTodo({ todo: currentTodo });
    }
  });
}

async function autofillCurrentTodo({ todo }: { todo: TTodo }) {
  const currentInputRef =
    inputRef || (getElementByXPath('//input') as HTMLInputElement);
  if (!currentInputRef) return;

  await new Promise(resolve => setTimeout(resolve, 1500));
  currentInputRef.value = todo.name;
  currentInputRef.dispatchEvent(new Event('input'));
  currentInputRef.focus();
  const keyUpEvent = new KeyboardEvent('keyup', {
    key: 'Enter',
    keyCode: 13,
    bubbles: true,
    cancelable: true,
  });
  currentInputRef.dispatchEvent(keyUpEvent);

  await new Promise(resolve => setTimeout(resolve, 1500));
  const checkBoxRef = getElementByXPath(
    `//ul[@id="todo-list"]//li[.//label[text()="${todo.name}"]]//input[@type="checkbox"]`
  ) as HTMLInputElement;
  if (!checkBoxRef) return;
  checkBoxRef.click();

  if (!checkBoxRef.checked) return;
  const parentLi = checkBoxRef.closest('li');
  if (parentLi) {
    const label = parentLi.querySelector('label');
    if (label) {
      const todoName = label.textContent?.trim();
      if (todoName) {
        sendMessageToTopFrame({
          type: 'TODO_COMPLETED',
          data: todoName,
        });
      }
    }
  }
}

function addIFrameEventListener() {
  document.body.addEventListener('click', handleClick);
  //   const listRef = getElementByXPath('//ul[@id="todo-list"]');
  //   if (listRef) {
  //     listRef.addEventListener('change', event => {
  //       const target = event.target;
  //       if (target instanceof HTMLInputElement && target.type === 'checkbox') {
  //         console.log('Checkbox changed:', target.checked);
  //       }
  //     });
  //   }
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target) return;
  if (
    target.tagName === 'BUTTON' &&
    target.classList.contains('clear-completed')
  ) {
    sendMessageToTopFrame({
      type: 'CLEAR_COMPLETED',
    });
  }
}
