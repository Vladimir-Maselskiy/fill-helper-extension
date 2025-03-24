import React, { useEffect, useState } from 'react';
import { StyledPopup } from './Popup.styled';
import { AutofillButton } from '../AutofillButton/AutofillButton';
import { TodoList } from '../TodoList/TodoList';
import { Button, Divider } from 'antd';
import { getCurrentAutofillStatus } from 'ContentScript/utils/getCurrentAutofillStatus';
import { initialTodoes } from 'ContentScript/data/initialTodoes';
import { updateTodoesStatus } from 'ContentScript/utils/updateTodoesStatus';
import {
  setAutofillButtonStatusToStorage,
  setTodoesStatusToStorage,
} from 'ContentScript/utils/setAutofillButtonStatusToStorage';
import { initializeIframe } from 'ContentScript/utils/initializeIframe';
import { getElementByXPath } from 'ContentScript/utils/getElementByXPath';
import { startAutofilling } from 'ContentScript/utils/startAutofilling';
import { clearTodoesStatus } from 'ContentScript/utils/clearTodoesStatus';
import { clearLocalStorage } from 'ContentScript/utils/clearLocalStorage';

export type TStatus = 'unfilled' | 'filling' | 'filled';
export type TTodo = { name: string; status: TStatus };

export const Popup = () => {
  const isTopLevel = window.top === window.self;

  const [todoes, setTodoes] = useState<TTodo[]>([]);
  const [autofillButtonStatus, setAutofillButtonStatus] =
    useState<TStatus | null>(null);
  const [isTodoInput, setIsTodoInput] = useState(false);
  const [isStartAutofilling, setIsStartAutofilling] = useState(false);
  const [currentTodoIndex, setCurrentTodoIndex] = useState(1);

  useEffect(() => {
    if (!isTopLevel) return;
    (async () => {
      const {
        topButton,
        todoes: todoesFromStorage,
      }: { topButton: TStatus | null; todoes: TTodo[] | null } =
        await getCurrentAutofillStatus();
      topButton
        ? setAutofillButtonStatus(topButton)
        : setAutofillButtonStatus('unfilled');
      todoesFromStorage && todoesFromStorage.length
        ? setTodoes(todoesFromStorage)
        : setTodoes(initialTodoes);
    })();
  }, []);

  useEffect(() => {
    if (!isTopLevel || !autofillButtonStatus) return;
    setAutofillButtonStatusToStorage(autofillButtonStatus);
  }, [autofillButtonStatus]);

  useEffect(() => {
    if (!isTopLevel || !todoes.length) return;
    setTodoesStatusToStorage(todoes);
  }, [todoes]);

  useEffect(() => {
    if (!isTopLevel || !isTodoInput) return;
    updateStartButtonStatus();
    if (!todoes.length) return;
    if (!isStartAutofilling) {
      updateTodoesStatus({
        target: todoes[currentTodoIndex].name,
        status: 'filling',
        todoes,
        setTodoes,
      });
      startAutofilling({ todoes, setTodoes, index: currentTodoIndex });
    }
    setIsStartAutofilling(true);
  }, [isTodoInput, todoes.length]);

  useEffect(() => {
    if (!isTopLevel) initializeIframe();
  }, []);

  useEffect(() => {
    if (isTopLevel) {
      const handleMessage = (event: MessageEvent) => {
        const { type, data } = event.data as { type: string; data?: any };
        if (type === 'INPUT_FOUND') {
          setIsTodoInput(true);
          updateStartButtonStatus();
        } else if (type === 'TODO_COMPLETED') {
          console.log('TODO_COMPLETED', data);
          updateTodoesStatus({
            target: data,
            status: 'filled',
            todoes,
            setTodoes,
          });
          const newIndex = currentTodoIndex + 1;
          if (todoes[newIndex]) {
            setCurrentTodoIndex(newIndex);
            startAutofilling({ todoes, setTodoes, index: newIndex });
          } else {
            setAutofillButtonStatus('filled');
            clearLocalStorage();
          }
        } else if (type === 'CLEAR_COMPLETED') {
          console.log('todoes', todoes);
          clearTodoesStatus({ todoes, setTodoes });
          setAutofillButtonStatus('unfilled');
          setCurrentTodoIndex(1);
          clearLocalStorage();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isTopLevel, todoes]);

  function updateStartButtonStatus() {
    const currentStartButtonStatus = todoes.find(
      todo => todo.name === todoes[0].name
    )?.status;
    if (currentStartButtonStatus === 'filled') return;
    if (autofillButtonStatus === 'filling') {
      updateTodoesStatus({
        target: todoes[0].name,
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
      buttonElement.click();
    } else {
      startAutofilling({ todoes, setTodoes, index: currentTodoIndex });
      updateTodoesStatus({
        target: todoes[0].name,
        status: 'filled',
        todoes,
        setTodoes,
      });
      console.log('Button not found!');
    }
  };
  return isTopLevel ? (
    <StyledPopup>
      <AutofillButton
        handleClick={() => handleClick({ target: todoes[0].name })}
        status={autofillButtonStatus}
      />
      <Divider />
      <TodoList todoes={todoes} />
    </StyledPopup>
  ) : null;
};
