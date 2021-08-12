import { createMemo } from 'solid-js';
import { zoomIdentity } from 'd3-zoom';

import { useStoreById } from '../store/state';
import { getTransformForBounds } from '../utils/graph';
import { getRectOfNodes } from '../utils/node';
import { FlowTransform, Rectangle, Point } from '../types';
import { pointToCanvasCoordinates } from '../utils/coordinates';

const DEFAULT_PADDING = 0.1;

export type FitViewParams = {
  padding?: number;
  includeHiddenNodes?: boolean;
};

export type FitViewFunc = (fitViewOptions?: FitViewParams) => void;

export interface ZoomPanHelperFunctions {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoomLevel: number) => void;
  transform: (transform: FlowTransform) => void;
  fitView: FitViewFunc;
  setCenter: (x: number, y: number, zoom?: number) => void;
  fitBounds: (bounds: Rectangle, padding?: number) => void;
  project: (point: Point) => Point;
  initialized: boolean;
}

const initialZoomPanHelper: ZoomPanHelperFunctions = {
  zoomIn: () => {},
  zoomOut: () => {},
  zoomTo: (_: number) => {},
  transform: (_: FlowTransform) => {},
  fitView: (_: FitViewParams = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {},
  setCenter: (_: number, __: number) => {},
  fitBounds: (_: Rectangle) => {},
  project: (position: Point) => position,
  initialized: false,
};

const useZoomPanHelper = (storeId: string) => {
  const [state] = useStoreById(storeId)!;

  const zoomPanHelperFunctions = createMemo<ZoomPanHelperFunctions>(() => {
    if (!state.d3Selection || !state.d3Zoom) return initialZoomPanHelper;

    return {
      zoomIn: () => state.d3Zoom!.scaleBy(state.d3Selection, 1.2),
      zoomOut: () => state.d3Zoom!.scaleBy(state.d3Selection, 1 / 1.2),
      zoomTo: (zoomLevel: number) => state.d3Zoom!.scaleTo(state.d3Selection, zoomLevel),
      transform: (transform: FlowTransform) => {
        const nextTransform = zoomIdentity.translate(transform.x, transform.y).scale(transform.zoom);

        state.d3Zoom!.transform(state.d3Selection, nextTransform);
      },
      fitView: (options: FitViewParams = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {
        if (!Object.values(state.nodes).length) {
          return;
        }

        const bounds = getRectOfNodes(options.includeHiddenNodes ? Object.values(state.nodes) : Object.values(state.nodes).filter(node => !node.isHidden));
        const [x, y, zoom] = getTransformForBounds(
          bounds,
          state.width,
          state.height,
          state.minZoom,
          state.maxZoom,
          options.padding ?? DEFAULT_PADDING
        );
        const transform = zoomIdentity.translate(x, y).scale(zoom);

        state.d3Zoom!.transform(state.d3Selection, transform);
      },
      setCenter: (x: number, y: number, zoom?: number) => {
        const nextZoom = typeof zoom !== 'undefined' ? zoom : state.maxZoom;
        const centerX = state.width / 2 - x * nextZoom;
        const centerY = state.height / 2 - y * nextZoom;
        const transform = zoomIdentity.translate(centerX, centerY).scale(nextZoom);

        state.d3Zoom!.transform(state.d3Selection, transform);
      },
      fitBounds: (bounds: Rectangle, padding = DEFAULT_PADDING) => {
        const [x, y, zoom] = getTransformForBounds(bounds, state.width, state.height, state.minZoom, state.maxZoom, padding);
        const transform = zoomIdentity.translate(x, y).scale(zoom);

        state.d3Zoom!.transform(state.d3Selection, transform);
      },
      project: (position: Point) => {
        return pointToCanvasCoordinates(position, state.transform, state.snapToGrid, state.snapGrid);
      },
      initialized: true,
    };
  });

  return zoomPanHelperFunctions;
};

export default useZoomPanHelper;
