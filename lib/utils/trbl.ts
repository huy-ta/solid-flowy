import { Point, Rectangle, Shape, TRBL } from '../types';

export type ShapeAsTRBL = (shape: Shape) => TRBL;

export const shapeAsTRBLFunctions: Record<string, ShapeAsTRBL> = {};

export const registerShapeAsTRBLFunction = (shapeType: string) => (shapeAsTRBLFunction: ShapeAsTRBL) => {
  shapeAsTRBLFunctions[shapeType] = shapeAsTRBLFunction;
}

export const shapeAsTRBL = (shapeType: string) => (shape: Shape): TRBL => {
  return shapeAsTRBLFunctions[shapeType](shape);
}

registerShapeAsTRBLFunction('rectangle')(rectangleOrPointAsTRBL);
registerShapeAsTRBLFunction('circle')(rectangleOrPointAsTRBL);

/**
 * Convert the given bounds to a { top, left, bottom, right } descriptor.
 *
 * @param {Rectangle|Point} rectangleOrPoint
 *
 * @return {TRBL}
 */
export function rectangleOrPointAsTRBL(rectangleOrPoint: Rectangle | Point): TRBL {
  return {
    top: rectangleOrPoint.y,
    right: rectangleOrPoint.x + ((rectangleOrPoint as Rectangle).width || 0),
    bottom: rectangleOrPoint.y + ((rectangleOrPoint as Rectangle).height || 0),
    left: rectangleOrPoint.x
  };
}

/**
 * Convert a { top, right, bottom, left } to a rectangle.
 *
 * @param {TRBL} trbl
 *
 * @return {Rectangle}
 */
export function trblAsRectangle(trbl: TRBL): Rectangle {
  return {
    x: trbl.left,
    y: trbl.top,
    width: trbl.right - trbl.left,
    height: trbl.bottom - trbl.top
  };
}
