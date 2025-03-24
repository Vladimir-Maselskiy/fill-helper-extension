import { TTodo } from 'ContentScript/components/Popup/Popup';
import browser from 'webextension-polyfill';

export const getInitalTodoes = async () => {
  const url = browser.runtime.getURL('/assets/data/initialTodoes.json');
  const response = await fetch(url)
    .then(response => response.json())
    .catch(error => console.error('Помилка при завантаженні JSON:', error));
  if (!response) {
    return [];
  }
  const initialTodoes: TTodo[] = response.map(
    ([name, actions]: [string, any[]]) => ({
      name,
      status: 'unfilled',
    })
  );
  return initialTodoes;
};
