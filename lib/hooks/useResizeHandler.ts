import { onCleanup, onMount } from 'solid-js';
import { useStoreById } from '../store/state';

import { getDimensions } from '../utils';

export default (rendererNode: HTMLDivElement | null, storeId: string) => {
  const [state, { updateSize }] = useStoreById(storeId);

  let resizeObserver: ResizeObserver;

  onMount(() => {
    const updateDimensions = () => {
      if (!rendererNode) {
        return;
      }
  
      const size = getDimensions(rendererNode);
  
      if (size.height === 0 || size.width === 0) {
        console.warn('The Solid Flowy parent container needs a width and a height to render the graph.');
      }
  
      updateSize(size);
    };
  
    updateDimensions();
    window.onresize = updateDimensions;
  
    if (rendererNode) {
      resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(rendererNode);
    }
  });

  onCleanup(() => {
    window.onresize = null;

    if (resizeObserver && rendererNode) {
      resizeObserver.unobserve(rendererNode);
    }
  });
};
