import { createStore, Store } from 'solid-js/store';
import { UndoRedo } from './UndoRedo';

export interface UndoRedoStoreState {
  isUndoable: boolean;
  isRedoable: boolean;
}

export interface UndoRedoStoreActions {
  setIsUndoable: (isUndoable: boolean) => void;
  setIsRedoable: (isRedoable: boolean) => void;
}

export type UndoRedoStore = [Store<UndoRedoStoreState>, UndoRedoStoreActions];

const storeMapping: Record<string, UndoRedoStore> = {};

export const initializeUndoRedoStore = (storeId: string) => {
  if (storeMapping[storeId]) return storeId;

  const initialState: UndoRedoStoreState = {
    isUndoable: false,
    isRedoable: false,
  }

  const [state, setState] = createStore(initialState);

  const store: UndoRedoStore = [
    state,
    {
      setIsUndoable: (isUndoable: boolean) => {
        setState('isUndoable', isUndoable);
      },
      setIsRedoable: (isRedoable: boolean) => {
        setState('isRedoable', isRedoable);
      },
    }
  ];

  storeMapping[storeId] = store;

  return storeId;
}

export const useUndoRedoStoreById = (storeId: string) => {
  return storeMapping[storeId];
}

export const updateUndoRedoStoreById = (storeId: string) => (undoRedo: UndoRedo<any>) => {
  const [state, { setIsUndoable, setIsRedoable }] = useUndoRedoStoreById(storeId);

  setIsUndoable(undoRedo.isUndoable());
  setIsRedoable(undoRedo.isRedoable());
};
