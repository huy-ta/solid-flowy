import { Component, createMemo, JSX, mergeProps, splitProps } from 'solid-js';

import ElementRenderer from '../ElementRenderer';
import { createNodeTypes } from '../NodeRenderer/utils';
import { createEdgeTypes } from '../EdgeRenderer/utils';
import {
  Elements,
  NodeTypesType,
  EdgeTypesType,
  Node,
  Edge,
  Point,
  FlowTransform,
  TranslateExtent,
  KeyCode,
  PanOnScrollMode,
  NodeExtent,
  DragDelta,
} from '../../types';

import '../../style.css';
import '../../theme-default.css';
import { FitViewFunc } from '../../hooks/useZoomPanHelper';

export type FlowyExportObject<T = any> = {
  elements: Elements<T>;
  position: [number, number];
  zoom: number;
};

export type ProjectFunc = (point: Point) => Point;
export type ToObjectFunc<T = any> = () => FlowyExportObject<T>;

export type OnLoadParams<T = any> = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoomLevel: number) => void;
  fitView: FitViewFunc;
  project: ProjectFunc;
  getElements: () => Elements<T>;
  setTransform: (transform: FlowTransform) => void;
  toObject: ToObjectFunc<T>;
};

export type OnLoadFunc<T = any> = (params: OnLoadParams<T>) => void;

export interface SolidFlowyProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onLoad'> {
  onBackgroundClick?: (event: MouseEvent) => void;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onElementsRemove?: (elements: Elements) => void;
  onNodeDblClick?: (event: MouseEvent, node: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  onLoad?: OnLoadFunc;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  onPaneScroll?: (event?: WheelEvent) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  zoomActivationKeyCode?: KeyCode;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  paneMoveable?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  defaultPosition?: [number, number];
  translateExtent?: TranslateExtent;
  nodeExtent?: NodeExtent;
  markerEndId?: string;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  zoomOnDoubleClick?: boolean;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  nodeTypesId?: string;
  edgeTypesId?: string;
  storeId: string;
  ref?: HTMLDivElement;
}

const SolidFlowy: Component<SolidFlowyProps> = (props) => {
  props = mergeProps(
    {
      zoomActivationKeyCode: 'Meta',
      snapToGrid: false,
      snapGrid: [15, 15],
      defaultZoom: 1,
      defaultPosition: [0, 0],
      zoomOnScroll: true,
      zoomOnPinch: true,
      panOnScroll: false,
      panOnScrollSpeed: 0.5,
      panOnScrollMode: PanOnScrollMode.Free,
      zoomOnDoubleClick: true,
      paneMoveable: true,
      edgeUpdaterRadius: 10,
    },
    props
  );

  const [local, others] = splitProps(props, [
    'children',
    'onLoad',
    'class',
    'onClick',
    'ref',
    'zoomActivationKeyCode',
    'snapToGrid',
    'snapGrid',
    'defaultZoom',
    'defaultPosition',
    'zoomOnScroll',
    'zoomOnPinch',
    'panOnScroll',
    'panOnScrollSpeed',
    'panOnScrollMode',
    'zoomOnDoubleClick',
    'paneMoveable',
    'edgeUpdaterRadius',
    'edgeTypes',
    'nodeTypes',
    'storeId',
  ]);


  const nodeTypesParsed = createMemo(() => createNodeTypes(props.nodeTypes));
  const edgeTypesParsed = createMemo(() => createEdgeTypes(props.edgeTypes));

  const handleClick = (e: MouseEvent) => {
    if (typeof props.onBackgroundClick === 'function') props.onBackgroundClick(e);
  };

  return (
    <div {...others} ref={props.ref} id={`solid-flowy__${props.storeId}`} classList={{ 'solid-flowy': true, [props.class]: true }} onClick={handleClick}>
      <ElementRenderer
        onLoad={props.onLoad}
        onMove={props.onMove}
        onMoveStart={props.onMoveStart}
        onMoveEnd={props.onMoveEnd}
        onElementClick={props.onElementClick}
        onNodeMouseEnter={props.onNodeMouseEnter}
        onNodeMouseMove={props.onNodeMouseMove}
        onNodeMouseLeave={props.onNodeMouseLeave}
        onNodeContextMenu={props.onNodeContextMenu}
        onNodeDblClick={props.onNodeDblClick}
        onNodeDragStart={props.onNodeDragStart}
        onNodeDrag={props.onNodeDrag}
        onNodeDragStop={props.onNodeDragStop}
        nodeTypes={nodeTypesParsed()}
        edgeTypes={edgeTypesParsed()}
        onElementsRemove={props.onElementsRemove}
        zoomActivationKeyCode={props.zoomActivationKeyCode}
        snapToGrid={props.snapToGrid}
        snapGrid={props.snapGrid}
        nodesDraggable={props.nodesDraggable}
        nodesConnectable={props.nodesConnectable}
        minZoom={props.minZoom}
        maxZoom={props.maxZoom}
        defaultZoom={props.defaultZoom}
        defaultPosition={props.defaultPosition}
        translateExtent={props.translateExtent}
        nodeExtent={props.nodeExtent}
        markerEndId={props.markerEndId}
        zoomOnScroll={props.zoomOnScroll}
        zoomOnPinch={props.zoomOnPinch}
        zoomOnDoubleClick={props.zoomOnDoubleClick}
        panOnScroll={props.panOnScroll}
        panOnScrollSpeed={props.panOnScrollSpeed}
        panOnScrollMode={props.panOnScrollMode}
        paneMoveable={props.paneMoveable}
        onPaneClick={props.onPaneClick}
        onPaneScroll={props.onPaneScroll}
        onPaneContextMenu={props.onPaneContextMenu}
        onEdgeContextMenu={props.onEdgeContextMenu}
        onEdgeDoubleClick={props.onEdgeDoubleClick}
        onEdgeMouseEnter={props.onEdgeMouseEnter}
        onEdgeMouseMove={props.onEdgeMouseMove}
        onEdgeMouseLeave={props.onEdgeMouseLeave}
        edgeUpdaterRadius={props.edgeUpdaterRadius}
        storeId={props.storeId}
      />
      {props.children}
    </div>
  );
};

export default SolidFlowy;
