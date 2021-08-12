import { SnapGrid, Transform, Canvas, Point } from '../types';

export const eventPointToCanvasCoordinates = (event: MouseEvent | TouchEvent | Event) => (canvas: Canvas) => {
  let clientX: number;
  let clientY: number;

  const touchEvent = event as TouchEvent;

  if (touchEvent.touches?.length) {
    clientX = touchEvent.touches[0].clientX;
    clientY = touchEvent.touches[0].clientY;
  } else {
    clientX = (event as MouseEvent).clientX;
    clientY = (event as MouseEvent).clientY;
  }

  return domPointToCanvasCoordinates({ clientX, clientY })(canvas);
};

export const domPointToCanvasCoordinates = (domPoint: { clientX: number, clientY: number }) => (canvas: Canvas) => {
  return {
    x: (domPoint.clientX - canvas.offset.x - canvas.position.x) / canvas.scale,
    y: (domPoint.clientY - canvas.offset.y - canvas.position.y) / canvas.scale,
  }
};

export const snapPointToGrid = (point: Point, [snapX, snapY]: SnapGrid) => {
  return {
    x: snapX * Math.round(point.x / snapX),
    y: snapY * Math.round(point.y / snapY)
  }
};

export const pointToCanvasCoordinates = (
  { x, y }: Point,
  [tx, ty, tScale]: Transform,
  snapToGrid: boolean,
  snapGrid: SnapGrid
): Point => {
  const point: Point = {
    x: (x - tx) / tScale,
    y: (y - ty) / tScale,
  };

  if (snapToGrid) {
    return snapPointToGrid(point, snapGrid);
  }

  return point;
};
