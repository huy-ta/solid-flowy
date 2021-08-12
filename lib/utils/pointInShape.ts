import { Point, Shape } from '../types';
import { isPointInRect } from './geometry';

export type IsPointInShape = (point: Point, shape: Shape) => boolean;

export const isPointInShapeFunctions: Record<string, IsPointInShape> = {};

export const isPointInShape = (shapeType: string) => (point: Point, shape: Shape) => {
  return isPointInShapeFunctions[shapeType](point, shape);
};

export const registerIsPointInShapeFunction = (shapeType: string) => (isPointInShapeFunction: IsPointInShape) => {
  isPointInShapeFunctions[shapeType] = isPointInShapeFunction;
};

registerIsPointInShapeFunction('rectangle')(isPointInRect);
registerIsPointInShapeFunction('circle')(isPointInRect);
