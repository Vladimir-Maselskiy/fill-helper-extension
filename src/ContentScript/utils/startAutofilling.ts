import { TTodo } from 'ContentScript/components/Popup/Popup';
import { getElementByXPath } from './getElementByXPath';

export const startAutofilling = ({
  todoes,
  setTodoes,
  index,
}: {
  todoes: TTodo[];
  setTodoes: React.Dispatch<React.SetStateAction<TTodo[]>>;
  index: number;
}) => {
  const currentIndex = index || 1;
  const iFrameRef = getElementByXPath(
    '//iframe[@src="https://todomvc.com/examples/jquery/dist/#/all"]'
  );

  if (iFrameRef && iFrameRef instanceof HTMLIFrameElement) {
    setTodoes(prev =>
      prev.map((todo, index) => {
        if (index === currentIndex) {
          return { ...todo, status: 'filling' };
        }
        return todo;
      })
    );
    iFrameRef.contentWindow?.postMessage(
      { type: 'START_AUTOFILLING', data: todoes, index: currentIndex },
      '*'
    );
  }
};
