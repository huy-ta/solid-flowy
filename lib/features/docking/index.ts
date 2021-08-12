import { Point, Shape } from '../../types';
import { getDockingPointFunctions } from './store';

export const getDockingPoint = (shapeType: string) => (point: Point, shape: Shape, dockingDirection: 'h' | 'v', targetOrientation: string) => {
  // Ensure we end up with a specific docking direction
  // based on the targetOrientation, if <h|v> is being passed
  const detailedDockingDirection: 't' | 'r' | 'b' | 'l' = dockingDirection === 'h' ? 
    /left/.test(targetOrientation) ? 'l' : 'r' :
    /top/.test(targetOrientation) ? 't' : 'b';

  return getDockingPointFunctions[shapeType](point, shape, detailedDockingDirection);
}
