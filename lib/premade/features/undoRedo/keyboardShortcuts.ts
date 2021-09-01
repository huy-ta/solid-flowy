let isCtrlJustPressed = false;

export const registerUndoRedoKeyboardShortcuts = (({ undo, redo }: { undo?: Function, redo?: Function }) => {
  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      isCtrlJustPressed = true;

      window.setTimeout(() => isCtrlJustPressed = false, 200);

      return;
    }

    if ((!e.ctrlKey && !isCtrlJustPressed) || e.key !== 'z') return;

    if (typeof undo === 'function') undo();
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      isCtrlJustPressed = true;

      window.setTimeout(() => isCtrlJustPressed = false, 200);

      return;
    }

    if ((!e.ctrlKey && !isCtrlJustPressed) || e.key !== 'y') return;

    if (typeof redo === 'function') redo();
  });
})
