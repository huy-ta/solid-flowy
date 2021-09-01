import { JSX, Component } from 'solid-js';

export type ElementId = string;

export type FlowElement<T = any> = Node<T> | Edge<T>;

export type Elements<T = any> = FlowElement<T>[];

export type Transform = [number, number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Box extends Point {
  x2: number;
  y2: number;
}

export interface TRBL {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  [prop: string]: any;
}

export interface Segment {
  directions: string;
  waypoints: Point[];
  turnNextDirections: boolean;
}

export interface Connection {
  waypoints: Point[];
  source: Shape;
  target: Shape;
  sourceShapeType: string;
  targetShapeType: string;
}


export type SnapGrid = [number, number];

export interface Node<T = any> {
  id: ElementId;
  position: Point;
  shapeType: string;
  shapeData?: Record<string, unknown>;
  width?: number;
  height?: number;
  type: string;
  data?: T;
  style?: JSX.CSSProperties;
  class?: string;
  isHidden?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  draggable?: boolean;
  connectable?: boolean;
}

export enum ArrowHeadType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
  ErrorArrowClosed = 'arrowclosed--error'
}

export interface Edge<T = any> {
  id: ElementId;
  type?: string;
  source: ElementId;
  target: ElementId;
  label?: string;
  waypoints: Point[];
  isForming?: boolean;
  style?: JSX.CSSProperties;
  arrowHeadType?: ArrowHeadType | string;
  isHidden?: boolean;
  isSelected?: boolean;
  isInvalid?: boolean;
  isDragging?: boolean;
  data?: T;
  class?: string;
}

export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
}

export type HandleType = 'source' | 'target';

export type NodeTypesType<T = any> = { [key: string]: Component<T> };

export type EdgeTypesType<T = any> = NodeTypesType<T>;

export interface EdgeProps<T = any> {
  edge: Edge<T>;
  markerEndId?: string;
  storeId: string;
}

export type FlowTransform = {
  x: number;
  y: number;
  zoom: number;
};

export interface Canvas {
  offset: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
  scale: number;
}

export type TranslateExtent = [[number, number], [number, number]];
export type NodeExtent = TranslateExtent;

export type KeyCode = number | string;

export type PathComponent = any[];
export type Path = string | PathComponent[];

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export enum Orientation {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  INTERSECT = 'intersect'
}

export enum Axis {
  X = 'x',
  Y = 'y',
}

export enum LayoutType {
  HORIZONTAL_HORIZONTAL = 'h:h',
  VERTICAL_VERTICAL = 'v:v',
  HORIZONTAL_VERTICAL = 'h:v',
  VERTICAL_HORIZONTAL = 'v:h',
  STRAIGHT = 'straight',
}

export enum Directions {
  HORIZONTAL_HORIZONTAL = 'h:h',
  VERTICAL_VERTICAL = 'v:v',
  HORIZONTAL_VERTICAL = 'h:v',
  VERTICAL_HORIZONTAL = 'v:h',
  STRAIGHT = 'straight',
  INTERSECT = 't:t'
}

export interface Hints {
  preserveDocking?: string;
  preferredLayouts?: LayoutType[];
  connectionStart?: Point | boolean;
  connectionEnd?: Point | boolean;
}

export interface ApproxIntersection {
  point: Point;
  bendpoint: boolean;
  index: number;
}


export interface Intersection {
  /**
   * Segment of first path.
   */
  segment1: number;

  /**
   * Segment of first path.
   */
  segment2: number;

  /**
   * The x coordinate.
   */
  x: number;

  /**
   * The y coordinate.
   */
  y: number;

  /**
   * Bezier curve for matching path segment 1.
   */
  bez1: number[];

  /**
   * Bezier curve for matching path segment 2.
   */
  bez2: number[];

  /**
   * Relative position of intersection on path segment1 (0.5 => in middle, 0.0 => at start, 1.0 => at end).
   */
  t1: number;

  /**
   * Relative position of intersection on path segment2 (0.5 => in middle, 0.0 => at start, 1.0 => at end).
   */
  t2: number;
}

export interface DragDelta {
  deltaX: number;
  deltaY: number;
}
