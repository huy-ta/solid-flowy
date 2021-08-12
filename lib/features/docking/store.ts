import { Point, Shape } from '../../types';
import { getDockingPointForCircle, getDockingPointForRectangle } from './shapeSupport';

export interface Docking {
  dockingPoint: Point;
  changedDockingPoint?: Point;
  direction: string | 't' | 'r' | 'b' | 'l';
}

export type GetDockingForShape = (point: Point, shape: Shape, detailedDockingDirection: 't' | 'r' | 'b' | 'l') => Docking;

export const getDockingPointFunctions: Record<string, GetDockingForShape> = {};

export const registerGetDockingPointFunction = (shapeType: string) => (getDockingForShapeFunction: GetDockingForShape) => {
  getDockingPointFunctions[shapeType] = getDockingForShapeFunction;
}

registerGetDockingPointFunction('rectangle')(getDockingPointForRectangle);
registerGetDockingPointFunction('circle')(getDockingPointForCircle);
