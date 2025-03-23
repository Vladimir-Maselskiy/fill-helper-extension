import React, { useEffect, useState } from 'react';
import { StyledPopup } from './Popup.styled';
import { AutofillButton } from '../AutofillButton/AutofillButton';
import { TodoList } from '../TodoList/TodoList';

export type TStatus = 'unfilled' | 'filling' | 'filled';
export type TTodo = { name: string; status: TStatus };

export const Popup = () => {
  let observer = null;
  const todoesJSON = ['start', 'foo', 'bar'];
  const [status, setStatus] = useState<'unfilled' | 'filling' | 'filled'>(
    'unfilled'
  );
  const [todoes, setTodoes] = useState<TTodo[]>([
    { name: 'start', status: 'unfilled' },
    { name: 'foo', status: 'unfilled' },
    { name: 'bar', status: 'unfilled' },
  ]);
  const [currentTodo, setCurrentTodo] = useState(todoesJSON[0]);

  const [todoInput, setTodoInput] = useState<HTMLInputElement | null>(null);

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
      targetElement.value = 'Hello, Autofill!'; // Вводимо текст
      console.log('Введено в інпут');
    }
  }

  const handleClick = () => {
    const buttonXPath = '//div[@role="button" and @id="startButton"]';
    const buttonElement = getElementByXPath(buttonXPath);

    if (buttonElement && buttonElement instanceof HTMLElement) {
      startAutofilling();
      buttonElement.click();
    } else {
      console.log('Button not found!');
    }
  };
  return window.top === window.self ? (
    <StyledPopup>
      <AutofillButton handleClick={handleClick} />
      <TodoList todoes={todoes} />
    </StyledPopup>
  ) : null;
};
