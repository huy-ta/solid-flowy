import { Point, Shape } from '../../types';
import { getDockingPointFunctions } from '../docking/store';

export const getCroppedWaypoints = (waypoints: Point[], sourceShape: Shape, targetShape: Shape, sourceShapeType: string, targetShapeType: string) => {
  const sourceDocking = getDocking(waypoints, sourceShape, sourceShapeType, true);
  const targetDocking = getDocking(waypoints, targetShape, targetShapeType);

  const croppedWaypoints = waypoints.slice(sourceDocking.index + 1, targetDocking.index);

  croppedWaypoints.unshift({ ...sourceDocking.actual });
  croppedWaypoints.push({ ...targetDocking.actual });

  return croppedWaypoints;
};

export const getDocking = (waypoints: Point[], shape: Shape, shapeType: string, dockStart: boolean = false) => {
  const dockingIndex = dockStart ? 0 : waypoints.length - 1;
  const dockingPoint = waypoints[dockingIndex];

  let direction: 't' | 'r' | 'b' | 'l';

  if (dockStart) {
    if (waypoints[0].y == waypoints[1].y) {
      direction = waypoints[0].x > waypoints[1].x ? 'l' : 'r';
    } else {
      direction = waypoints[0].y > waypoints[1].y ? 't' : 'b';
    }
  } else {
    if (waypoints[waypoints.length - 1].y == waypoints[waypoints.length - 2].y) {
      direction = waypoints[waypoints.length - 1].x > waypoints[waypoints.length - 2].x ? 'l' : 'r';
    } else {
      direction = waypoints[waypoints.length - 1].y > waypoints[waypoints.length - 2].y ? 't' : 'b';
    }
  }

  const croppedPoint = getDockingPointFunctions[shapeType](dockingPoint, shape, direction);

  return {
    point: dockingPoint,
    actual: croppedPoint.dockingPoint || dockingPoint,
    index: dockingIndex
  };
};
