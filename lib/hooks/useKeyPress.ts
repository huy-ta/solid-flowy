import { createEffect, createSignal, onCleanup } from 'solid-js';

import { isInputDOMNode } from '../utils';
import { KeyCode } from '../types';

export default (keyCode?: KeyCode) => {
  const [isKeyPressed, setIsKeyPressed] = createSignal(false);

  createEffect(() => {
    if (typeof keyCode === 'undefined') return;

    const downHandler = (event: KeyboardEvent) => {
      if (!isInputDOMNode(event) && (event.key === keyCode || event.keyCode === keyCode)) {
        event.preventDefault();

        setIsKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (!isInputDOMNode(event) && (event.key === keyCode || event.keyCode === keyCode)) {
        setIsKeyPressed(false);
      }
    };

    const resetHandler = () => setIsKeyPressed(false);

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('blur', resetHandler);

    onCleanup(() => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('blur', resetHandler);
    });
  });

  return isKeyPressed;
};
