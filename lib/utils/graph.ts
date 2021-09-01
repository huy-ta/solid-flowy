import { clamp } from '.';
import { Rectangle } from '..';

import {
  Node,
  Edge,
  Transform,
  Canvas,
  Point,
} from '../types';

export const graphPosToZoomedPos = ({ x, y }: Point, [tx, ty, tScale]: Transform): Point => ({
  x: x * tScale + tx,
  y: y * tScale + ty,
});

export const getConnectedEdges = (nodes: Node[], edges: Edge[]): Edge[] => {
  const nodeIds = nodes.map((node) => node.id);

  return edges.filter((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
};

export const getTransformForBounds = (
  bounds: Rectangle,
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number,
  padding: number = 0.1
): Transform => {
  const xZoom = width / (bounds.width * (1 + padding));
  const yZoom = height / (bounds.height * (1 + padding));
  const zoom = Math.min(xZoom, yZoom);
  const clampedZoom = clamp(zoom, minZoom, maxZoom);
  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;
  const x = width / 2 - boundsCenterX * clampedZoom;
  const y = height / 2 - boundsCenterY * clampedZoom;

  return [x, y, clampedZoom];
};

export const getSolidFlowyElement = () => {
  return document.querySelector('.solid-flowy');
}

export const getCanvas = (canvasTransform: Transform): Canvas => {
  const reactFlowyElement = getSolidFlowyElement() as HTMLDivElement;
  const reactFlowyElementBoundingRect = reactFlowyElement.getBoundingClientRect();

  return {
    offset: {
      x: reactFlowyElementBoundingRect.x,
      y: reactFlowyElementBoundingRect.y,
    },
    position: {
      x: canvasTransform[0],
      y: canvasTransform[1]
    },
    scale: canvasTransform[2],
  };
}
