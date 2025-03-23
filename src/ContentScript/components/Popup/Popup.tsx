import React, { useEffect, useState } from 'react';
import { StyledPopup } from './Popup.styled';
import { AutofillButton } from '../AutofillButton/AutofillButton';
import { TodoList } from '../TodoList/TodoList';
import { Divider, Flex, Tag } from 'antd';
import { getCurrentAutofillStatus } from 'ContentScript/utils/getCurrentAutofillStatus';
import { initialTodoes } from 'ContentScript/data/initialTodoes';
import { updateTodoesStatus } from 'ContentScript/utils/updateTodoesStatus';
import {
  setAutofillButtonStatusToStorage,
  setTodoesStatusToStorage,
} from 'ContentScript/utils/setAutofillButtonStatusToStorage';
import { initializeIframe } from 'ContentScript/utils/initializeIframe';
import { getElementByXPath } from 'ContentScript/utils/getElementByXPath';
import { start } from 'repl';
import { startAutofilling } from 'ContentScript/utils/startAutofilling';

export type TStatus = 'unfilled' | 'filling' | 'filled';
export type TTodo = { name: string; status: TStatus };

export const Popup = () => {
  const isTopLevel = window.top === window.self;

  const [todoes, setTodoes] = useState<TTodo[]>([]);
  const [autofillButtonStatus, setAutofillButtonStatus] =
    useState<TStatus | null>(null);
  const [isTodoInput, setIsTodoInput] = useState(false);
  const [isStartAutofilling, setIsStartAutofilling] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        topButton,
        todoes: todoesFromStorage,
      }: { topButton: TStatus | null; todoes: TTodo[] | null } =
        await getCurrentAutofillStatus();
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
    if (!todoes.length) return;
    setTodoesStatusToStorage(todoes);
    isTodoInput && updateStartButtonStatus();
  }, [todoes]);

  useEffect(() => {
    if (isTodoInput) {
      updateStartButtonStatus();
      if (!todoes.length) return;
      if (!isStartAutofilling) startAutofilling(todoes);
      setIsStartAutofilling(true);
    }
  }, [isTodoInput, todoes.length]);

  useEffect(() => {
    if (!isTopLevel) initializeIframe();
  }, []);

  useEffect(() => {
    if (isTopLevel) {
      window.addEventListener('message', event => {
        if (event.data.type === 'INPUT_FOUND') {
          setIsTodoInput(true);
        }
      });
    }
  });

  function updateStartButtonStatus() {
    const currentStartButtonStatus = todoes.find(
      todo => todo.name === 'start'
    )?.status;
    if (currentStartButtonStatus === 'filled') return;
    if (
      autofillButtonStatus === 'filling' ||
      autofillButtonStatus === 'filled'
    ) {
      updateTodoesStatus({
        target: 'start',
        status: 'filled',
        todoes,
        setTodoes,
      });
    }
  }

  const handleClick = ({ target }: { target: string }) => {
    setAutofillButtonStatus('filling');
    updateTodoesStatus({ target, status: 'filling', todoes, setTodoes });

    const buttonXPath = '//div[@role="button" and @id="startButton"]';
    const buttonElement = getElementByXPath(buttonXPath);

    if (buttonElement && buttonElement instanceof HTMLElement) {
      //   startAutofilling();
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
