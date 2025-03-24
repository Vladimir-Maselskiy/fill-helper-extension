import { TTodo } from 'ContentScript/components/Popup/Popup';

export const getIsNewInitialTodoes = ({
  todoesFromStorage,
  initialTodoes,
}: {
  todoesFromStorage: TTodo[] | null;
  initialTodoes: TTodo[];
}) => {
  const todoKeysFromStorage = todoesFromStorage
    ? JSON.stringify(todoesFromStorage.map(todo => todo.name))
    : '[]';
  const todoKeysFromInitialTodoes = JSON.stringify(
    initialTodoes.map(todo => todo.name)
  );
  return todoKeysFromStorage !== todoKeysFromInitialTodoes;
};
