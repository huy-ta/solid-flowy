import { createEffect } from 'solid-js';

import ZoomPaneRenderer from '../ZoomPaneRenderer/ZoomPaneRenderer';
import NodeRenderer from '../NodeRenderer';
import EdgeRenderer from '../EdgeRenderer';
import useZoomPanHelper from '../../hooks/useZoomPanHelper';

import { FlowyExportObject, SolidFlowyProps } from '../SolidFlowy';

import { NodeTypesType, EdgeTypesType, Elements, Point } from '../../types';
import { SolidFlowyState, useStoreById } from '../../store/state';
import { pointToCanvasCoordinates } from '../../utils/coordinates';
import { parseElements } from '../../utils/parse';

export const onLoadProject = (state: SolidFlowyState) => {
  return (position: Point): Point => {
    const { transform, snapToGrid, snapGrid } = state;

    return pointToCanvasCoordinates(position, transform, snapToGrid, snapGrid);
  };
};

export const onLoadGetElements = (state: SolidFlowyState) => {
  return (): Elements => {
    const { nodes = {}, edges = {} } = state;

    return parseElements(Object.values(nodes), Object.values(edges));
  };
};

export const onLoadToObject = (state: SolidFlowyState) => {
  return (): FlowyExportObject => {
    const { nodes = [], edges = [], transform } = state;

    return {
      elements: parseElements(Object.values(nodes), Object.values(edges)),
      position: [transform[0], transform[1]],
      zoom: transform[2],
    };
  };
};

export interface ElementRendererProps extends Omit<SolidFlowyProps, 'elements'> {
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  snapToGrid: boolean;
  snapGrid: [number, number];
  defaultZoom: number;
  defaultPosition: [number, number];
  storeId: string;
}

const ElementRenderer = (props: ElementRendererProps) => {
  const [state, { setMaxZoom, setMinZoom, setNodeExtent, setNodesConnectable, setNodesDraggable, setSnapGrid, setSnapToGrid, setTranslateExtent }] = useStoreById(props.storeId);
  let isInitialized = false;
  const zoomPanHelpers = useZoomPanHelper(props.storeId);

  createEffect(() => {
    const { zoomIn, zoomOut, zoomTo, transform, fitView, initialized } = zoomPanHelpers();

    if (!isInitialized && initialized) {
      if (typeof props.onLoad === 'function') {
        props.onLoad({
          fitView: (params = { padding: 0.1 }) => fitView(params),
          zoomIn,
          zoomOut,
          zoomTo,
          setTransform: transform,
          project: onLoadProject(state),
          getElements: onLoadGetElements(state),
          toObject: onLoadToObject(state),
        });
      }

      isInitialized = true;
    }
  });

  createEffect(() => {
    if (typeof props.snapToGrid !== 'undefined') {
      setSnapToGrid(props.snapToGrid);
    }
  });

  createEffect(() => {
    if (typeof props.snapGrid !== 'undefined') {
      setSnapGrid(props.snapGrid);
    }
  });

  createEffect(() => {
    if (typeof props.nodesDraggable !== 'undefined') {
      setNodesDraggable(props.nodesDraggable);
    }
  });

  createEffect(() => {
    if (typeof props.nodesConnectable !== 'undefined') {
      setNodesConnectable(props.nodesConnectable);
    }
  });

  createEffect(() => {
    if (typeof props.minZoom !== 'undefined') {
      setMinZoom(props.minZoom);
    }
  });

  createEffect(() => {
    if (typeof props.maxZoom !== 'undefined') {
      setMaxZoom(props.maxZoom);
    }
  });

  createEffect(() => {
    if (typeof props.translateExtent !== 'undefined') {
      setTranslateExtent(props.translateExtent);
    }
  });

  createEffect(() => {
    if (typeof props.nodeExtent !== 'undefined') {
      setNodeExtent(props.nodeExtent);
    }
  });

  return (
    <ZoomPaneRenderer
      onPaneClick={props.onPaneClick}
      onPaneContextMenu={props.onPaneContextMenu}
      onPaneScroll={props.onPaneScroll}
      onElementsRemove={props.onElementsRemove}
      zoomActivationKeyCode={props.zoomActivationKeyCode}
      onMove={props.onMove}
      onMoveStart={props.onMoveStart}
      onMoveEnd={props.onMoveEnd}
      zoomOnScroll={props.zoomOnScroll}
      zoomOnPinch={props.zoomOnPinch}
      zoomOnDoubleClick={props.zoomOnDoubleClick}
      panOnScroll={props.panOnScroll}
      panOnScrollSpeed={props.panOnScrollSpeed}
      panOnScrollMode={props.panOnScrollMode}
      paneMoveable={props.paneMoveable}
      defaultPosition={props.defaultPosition}
      defaultZoom={props.defaultZoom}
      translateExtent={props.translateExtent}
      storeId={props.storeId}
    >
      <NodeRenderer
        nodeTypes={props.nodeTypes}
        onElementClick={props.onElementClick}
        onNodeDblClick={props.onNodeDblClick}
        onNodeMouseEnter={props.onNodeMouseEnter}
        onNodeMouseMove={props.onNodeMouseMove}
        onNodeMouseLeave={props.onNodeMouseLeave}
        onNodeContextMenu={props.onNodeContextMenu}
        onNodeDragStop={props.onNodeDragStop}
        onNodeDrag={props.onNodeDrag}
        onNodeDragStart={props.onNodeDragStart}
        snapToGrid={props.snapToGrid}
        snapGrid={props.snapGrid}
        storeId={props.storeId}
      />
      <EdgeRenderer
        edgeTypes={props.edgeTypes}
        onElementClick={props.onElementClick}
        onEdgeDoubleClick={props.onEdgeDoubleClick}
        markerEndId={props.markerEndId}
        onEdgeContextMenu={props.onEdgeContextMenu}
        onEdgeMouseEnter={props.onEdgeMouseEnter}
        onEdgeMouseMove={props.onEdgeMouseMove}
        onEdgeMouseLeave={props.onEdgeMouseLeave}
        edgeUpdaterRadius={props.edgeUpdaterRadius}
        storeId={props.storeId}
      />
    </ZoomPaneRenderer>
  );
};

export default ElementRenderer;
