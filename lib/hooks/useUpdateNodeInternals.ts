import { useStoreById } from '../store/state';

import { ElementId } from '../types';

export type UpdateNodeInternals = (nodeId: ElementId) => void;

function useUpdateNodeInternals(storeId: string): UpdateNodeInternals {
  const [state, { updateNodeDimensions }] = useStoreById(storeId)!;

  return (id: ElementId) => {
    const nodeElement = document.querySelector(`.solid-flowy__node[data-id="${id}"]`) as HTMLDivElement;

    if (nodeElement) {
      updateNodeDimensions([{ id, nodeElement, forceUpdate: true }]);
    }
  };
}

export default useUpdateNodeInternals;
