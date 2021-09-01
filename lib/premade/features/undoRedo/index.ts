import { useStoreById } from '../../../store/state';
import { Elements } from '../../../types';
import { subscribeToFinalElementChanges } from '../subscription';
import { registerUndoRedoKeyboardShortcuts } from './keyboardShortcuts';
import { initializeUndoRedoStore, updateUndoRedoStoreById } from './store';
import { UndoRedo } from './UndoRedo';

export const initializeUndoRedo = (storeId: string) => {
  let skipSubscription = false;
  let batchUpdateTimeout: number;
  const [state, { setElements }] = useStoreById(storeId)!;
  initializeUndoRedoStore(storeId);
  const undoRedo = new UndoRedo<Elements>();

  subscribeToFinalElementChanges(storeId)(elements => {
    if (batchUpdateTimeout) clearTimeout(batchUpdateTimeout);

    if (skipSubscription) {
      window.setTimeout(() => {
        skipSubscription = false;
      });

      return;
    }

    batchUpdateTimeout = window.setTimeout(() => {
      undoRedo.save(elements);
  
      updateUndoRedoStoreById(storeId)(undoRedo);
    }, 100);
  });

  const undo = () => {
    const undo = undoRedo.undo();

    updateUndoRedoStoreById(storeId)(undoRedo);
  
    if (!undo) return;
  
    skipSubscription = true;
    setElements(undo as Elements);
  };
  
  const redo = () => {
    const redo = undoRedo.redo();

    updateUndoRedoStoreById(storeId)(undoRedo);
  
    if (!redo) return;
  
    skipSubscription = true;
    setElements(redo);
  };

  registerUndoRedoKeyboardShortcuts({ undo, redo });

  return {
    undo,
    redo,
    undoRedoInstance: undoRedo,
  }
};
