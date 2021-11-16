import isDeepEqual from 'fast-deep-equal';
import { createEffect, createRoot } from 'solid-js';

import { useStoreById } from '../../../store/state';
import { Node, Edge, Elements } from '../../../types';

let ignoreNextChangeByStoreId: Record<string, boolean> = {};

const normalizeUnstablePropertiesFromElements = (elements: Node[] | Edge[] | Elements) => {
  const elementsWithUnstablePropertiesExcluded = (elements as Node[])
    .map(({ width, height, ...node }) => node)
    .filter((node) => !node.isDragging);

  return (elementsWithUnstablePropertiesExcluded as unknown as Edge[]).filter((edge) => !edge.isDragging);
};

export const ignoreNextChange = (storeId: string) => {
  ignoreNextChangeByStoreId[storeId] = true;
};

export type ElementChangeListener = (elements: Elements) => void;

const listenerMapping: Record<string, undefined | ElementChangeListener[]> = {};

const activateStoreSubscription = (storeId: string) => {
  let previousElements: Elements = [];
  const [state] = useStoreById(storeId)!;

  if (listenerMapping[storeId]) return;

  listenerMapping[storeId] = [];

  const listeners = listenerMapping[storeId]!;

  createRoot(() => {
    createEffect(() => {
      const edges = Object.values(state.edges).filter((edge) => edge.target !== '?' && !edge.isForming);
      const elements = [...Object.values(state.nodes), ...edges];

      elements.forEach(({ id, isDragging, isSelected }) => {
        previousElements = previousElements.map((previousElement) => {
          if (previousElement.id !== id) return previousElement;

          const element = { ...previousElement };

          if (isDragging !== undefined) element.isDragging = isDragging;
          else delete element.isDragging;

          if (isSelected !== undefined) element.isSelected = isSelected;
          else delete element.isSelected;

          return element;
        });
      });

      const previousElementsToCompare = normalizeUnstablePropertiesFromElements(previousElements);
      const elementsToCompare = normalizeUnstablePropertiesFromElements(elements);

      if (isDeepEqual(previousElementsToCompare, elementsToCompare)) return;

      previousElements = elements;

      if (ignoreNextChangeByStoreId[storeId]) {
        delete ignoreNextChangeByStoreId[storeId];

        return;
      }

      listeners.forEach((listener) => listener(elements));
    });
  });
};

export const subscribeToFinalElementChanges = (storeId: string) => (listener: ElementChangeListener) => {
  if (!listenerMapping[storeId]) {
    activateStoreSubscription(storeId);
  }

  const listeners = listenerMapping[storeId]!;

  listeners.push(listener);

  return function unsubscribe() {
    listenerMapping[storeId] = listenerMapping[storeId]!.filter((l) => l !== listener);
  };
};
