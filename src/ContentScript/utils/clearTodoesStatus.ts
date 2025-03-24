import { TTodo } from 'ContentScript/components/Popup/Popup';

export const clearTodoesStatus = async ({
  todoes,
  setTodoes,
}: {
  todoes: TTodo[];
  setTodoes: React.Dispatch<React.SetStateAction<TTodo[]>>;
}) => {
  console.log('todoes', todoes);
  const newTodoes: TTodo[] = todoes.map(todo => {
    return { ...todo, status: 'unfilled' };
  });
  setTodoes(newTodoes);
};
