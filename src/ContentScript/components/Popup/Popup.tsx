import React, { useEffect, useState } from 'react';
import { StyledPopup } from './Popup.styled';
import { AutofillButton } from '../AutofillButton/AutofillButton';
import { TodoList } from '../TodoList/TodoList';
import { Divider, Flex, Tag } from 'antd';
import { getCurrentAutofillStatus } from 'ContentScript/utils/getCurrentAutofillStatus';
import { initialTodoes } from 'ContentScript/data/initialTodoes';
import { updateTodoesStatus } from 'ContentScript/utils/updateTodoesStatus';
import { setAutofillButtonStatusToStorage } from 'ContentScript/utils/setAutofillButtonStatusToStorage';

export type TStatus = 'unfilled' | 'filling' | 'filled';
export type TTodo = { name: string; status: TStatus };

export const Popup = () => {
  let observer = null;
  const isTopLevel = window.top === window.self;
  const todoesJSON = ['start', 'foo', 'bar'];

  const [todoes, setTodoes] = useState<TTodo[]>([]);
  const [autofillButtonStatus, setAutofillButtonStatus] =
    useState<TStatus | null>(null);
  const [currentTodo, setCurrentTodo] = useState('');
  const [todoInput, setTodoInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const {
        topButton,
        todoes: todoesFromStorage,
      }: { topButton: TStatus | null; todoes: TTodo[] | null } =
        await getCurrentAutofillStatus();
      console.log('topButton', topButton);
      console.log('todoesFromStorage', todoesFromStorage);
      topButton
        ? setAutofillButtonStatus(topButton)
        : setAutofillButtonStatus('unfilled');
      todoesFromStorage
        ? setTodoes(todoesFromStorage)
        : setTodoes(initialTodoes);
    })();
  }, []);

  useEffect(() => {
    if (!autofillButtonStatus) return;
    setAutofillButtonStatusToStorage(autofillButtonStatus);
  }, [autofillButtonStatus]);

  useEffect(() => {
    observeForElement({
      xPath: '//input',
    });
  }, []);

  useEffect(() => {
    if (todoInput) {
      todoInput.value = 'Hello, Autofill!';
    }
  }, [todoInput]);

  function getElementByXPath(xpath: string) {
    console.log(document.body.innerHTML);
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    console.log('result', result);
    return result.singleNodeValue;
  }

  function observeForElement({
    xPath,
  }: {
    xPath: string;
  }): Promise<Node | null> {
    const targetElement = getElementByXPath(xPath);
    if (targetElement) {
      setTodoInput(targetElement as HTMLInputElement);
      return Promise.resolve(targetElement);
    }
    return new Promise(resolve => {
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            console.log('mutation', mutation);
            const targetElement = getElementByXPath(xPath);

            if (targetElement) {
              console.log('targetElement', targetElement);
              setTodoInput(targetElement as HTMLInputElement);
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

  async function startAutofilling() {
    const targetElement = await observeForElement({
      xPath: '//input[@id="new-todo"]',
    });
    if (targetElement instanceof HTMLInputElement) {
      targetElement.value = 'Hello, Autofill!';
    }
  }

  const handleClick = ({ target }: { target: string }) => {
    setAutofillButtonStatus('filling');
    updateTodoesStatus({ target, status: 'filling', todoes, setTodoes });

    const buttonXPath = '//div[@role="button" and @id="startButton"]';
    const buttonElement = getElementByXPath(buttonXPath);

    if (buttonElement && buttonElement instanceof HTMLElement) {
      startAutofilling();
      buttonElement.click();
    } else {
      console.log('Button not found!');
    }
  };
  return isTopLevel ? (
    <StyledPopup>
      <AutofillButton
        handleClick={() => handleClick({ target: 'start' })}
        status={autofillButtonStatus}
      />
      <Divider />
      <TodoList todoes={todoes} />
    </StyledPopup>
  ) : null;
};
