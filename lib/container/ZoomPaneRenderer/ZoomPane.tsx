import { createEffect, onMount, mergeProps, Component } from 'solid-js';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select, pointer } from 'd3-selection';

import { clamp } from '../../utils';
import useKeyPress from '../../hooks/useKeyPress';
import useResizeHandler from '../../hooks/useResizeHandler';
import { FlowTransform, TranslateExtent, PanOnScrollMode, KeyCode } from '../../types';
import { useStoreById } from '../../store/state';

interface ZoomPaneProps {
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  zoomOnDoubleClick?: boolean;
  paneMoveable?: boolean;
  defaultPosition?: [number, number];
  defaultZoom?: number;
  translateExtent?: TranslateExtent;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  zoomActivationKeyCode?: KeyCode;
  storeId: string;
}

const viewChanged = (prevTransform: FlowTransform, eventTransform: any): boolean =>
  prevTransform.x !== eventTransform.x ||
  prevTransform.y !== eventTransform.y ||
  prevTransform.zoom !== eventTransform.k;

const eventToFlowTransform = (eventTransform: any): FlowTransform => ({
  x: eventTransform.x,
  y: eventTransform.y,
  zoom: eventTransform.k,
});

const ZoomPane: Component<ZoomPaneProps> = (props) => {
  props = mergeProps({
    zoomOnScroll: true,
    zoomOnPinch: true,
    panOnScroll: false,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: PanOnScrollMode.Free,
    zoomOnDoubleClick: true,
    panMoveable: true,
    defaultPosition: [0, 0],
    defaultZoom: 1,
  }, props);

  const [state, { initD3Zoom, updateTransform }] = useStoreById(props.storeId)!;
  let zoomPane: HTMLDivElement;
  let prevTransform: FlowTransform = { x: 0, y: 0, zoom: 0 };

  const zoomActivationKeyPressed = useKeyPress(props.zoomActivationKeyCode);

  onMount(() => {
    useResizeHandler(zoomPane, props.storeId);

    if (!zoomPane) return;

    const currentTranslateExtent = typeof props.translateExtent !== 'undefined' ? props.translateExtent : state.translateExtent;
    const d3ZoomInstance = zoom().scaleExtent([state.minZoom, state.maxZoom]).translateExtent(currentTranslateExtent);
    const selection = select(zoomPane as Element).call(d3ZoomInstance);

    const clampedX = clamp(props.defaultPosition[0], currentTranslateExtent[0][0], currentTranslateExtent[1][0]);
    const clampedY = clamp(props.defaultPosition[1], currentTranslateExtent[0][1], currentTranslateExtent[1][1]);
    const clampedZoom = clamp(props.defaultZoom, state.minZoom, state.maxZoom);
    const updatedTransform = zoomIdentity.translate(clampedX, clampedY).scale(clampedZoom);

    d3ZoomInstance.transform(selection, updatedTransform);

    initD3Zoom({
      d3Zoom: d3ZoomInstance,
      d3Selection: selection,
      d3ZoomHandler: selection.on('wheel.zoom'),
      // we need to pass transform because zoom handler is not registered when we set the initial transform
      transform: [clampedX, clampedY, clampedZoom],
    });
  });

  createEffect(() => {
    if (!state.d3Selection || !state.d3Zoom) return;

    if (props.panOnScroll && !zoomActivationKeyPressed()) {
      state.d3Selection
        .on('wheel', (event: WheelEvent) => {
          event.preventDefault();
          event.stopImmediatePropagation();

          const currentZoom = state.d3Selection.property('__zoom').k || 1;

          if (event.ctrlKey && props.zoomOnPinch) {
            const point = pointer(event);
            // taken from https://github.com/d3/d3-zoom/blob/master/src/zoom.js
            const pinchDelta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * 10;
            const zoom = currentZoom * Math.pow(2, pinchDelta);
            state.d3Zoom.scaleTo(state.d3Selection, zoom, point);

            return;
          }

          // increase scroll speed in firefox
          // firefox: deltaMode === 1; chrome: deltaMode === 0
          const deltaNormalize = event.deltaMode === 1 ? 20 : 1;
          const deltaX = props.panOnScrollMode === PanOnScrollMode.Vertical ? 0 : event.deltaX * deltaNormalize;
          const deltaY = props.panOnScrollMode === PanOnScrollMode.Horizontal ? 0 : event.deltaY * deltaNormalize;

          state.d3Zoom.translateBy(
            state.d3Selection,
            -(deltaX / currentZoom) * props.panOnScrollSpeed,
            -(deltaY / currentZoom) * props.panOnScrollSpeed
          );
        })
        .on('wheel.zoom', null);
    } else if (typeof state.d3ZoomHandler !== 'undefined') {
      state.d3Selection.on('wheel', null).on('wheel.zoom', state.d3ZoomHandler);
    }
  });

  createEffect(() => {
    if (state.d3Zoom) {
      state.d3Zoom.on('zoom', (event: any) => {
        updateTransform([event.transform.x, event.transform.y, event.transform.k]);

        if (typeof props.onMove === 'function') {
          const flowTransform = eventToFlowTransform(event.transform);

          props.onMove(flowTransform);
        }
      });
    }
  });

  createEffect(() => {
    if (state.d3Zoom) {
      if (typeof props.onMoveStart === 'function') {
        state.d3Zoom.on('start', (event: any) => {
          if (viewChanged(prevTransform, event.transform)) {
            const flowTransform = eventToFlowTransform(event.transform);
            prevTransform = flowTransform;

            props.onMoveStart(flowTransform);
          }
        });
      } else {
        state.d3Zoom.on('start', null);
      }
    }
  });

  createEffect(() => {
    if (state.d3Zoom) {
      if (typeof props.onMoveEnd === 'function') {
        state.d3Zoom.on('end', (event: any) => {
          if (viewChanged(prevTransform, event.transform)) {
            const flowTransform = eventToFlowTransform(event.transform);
            prevTransform = flowTransform;

            props.onMoveEnd(flowTransform);
          }
        });
      } else {
        state.d3Zoom.on('end', null);
      }
    }
  });

  createEffect(() => {
    if (state.d3Zoom) {
      state.d3Zoom.filter((event: any) => {
        const zoomScroll = zoomActivationKeyPressed() || props.zoomOnScroll;
        const pinchZoom = props.zoomOnPinch && event.ctrlKey;

        // if all interactions are disabled, we prevent all zoom events
        if (!props.paneMoveable && !zoomScroll && !props.panOnScroll && !props.zoomOnDoubleClick && !props.zoomOnPinch) {
          return false;
        }

        // if zoom on double click is disabled, we prevent the double click event
        if (!props.zoomOnDoubleClick && event.type === 'dblclick') {
          return false;
        }

        if (event.target.closest('.nowheel') && event.type === 'wheel') {
          return false;
        }

        // when the target element is a node, we still allow zooming
        if (
          (event.target.closest('.solid-flowy__node') || event.target.closest('.solid-flowy__edge')) &&
          event.type !== 'wheel'
        ) {
          return false;
        }

        if (!props.zoomOnPinch && event.ctrlKey && event.type === 'wheel') {
          return false;
        }

        // when there is no scroll handling enabled, we prevent all wheel events
        if (!zoomScroll && !props.panOnScroll && !pinchZoom && event.type === 'wheel') {
          return false;
        }

        // if the pane is not movable, we prevent dragging it with mousestart or touchstart
        if (!props.paneMoveable && (event.type === 'mousedown' || event.type === 'touchstart')) {
          return false;
        }

        // default filter for d3-zoom
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      });
    }
  });

  return (
    <div className="solid-flowy__renderer solid-flowy__zoompane" ref={zoomPane}>
      {props.children}
    </div>
  );
};

export default ZoomPane;
