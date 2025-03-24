import { TStatus, TTodo } from 'ContentScript/components/Popup/Popup';

export const updateTodoesStatus = ({
  target,
  status,
  todoes,
  setTodoes,
}: {
  target: string;
  status: TStatus;
  todoes: TTodo[];
  setTodoes: React.Dispatch<React.SetStateAction<TTodo[]>>;
}) => {
  setTodoes(prev =>
    prev.map(todo => {
      if (todo.name === target) {
        return { ...todo, status: status };
      }
      return todo;
    })
  );
};
