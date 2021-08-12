import { Point } from '../../types';
import { arePointsOnLine, getPointDistance } from '../../utils/geometry';

export function filterRedundantWaypoints(waypoints: Point[], accuracy = 2) {
  // alter copy of waypoints, not original
  waypoints = waypoints.slice();

  let index = 0;
  let point;
  let previousPoint;
  let nextPoint;

  while (waypoints[index]) {
    point = waypoints[index];
    previousPoint = waypoints[index - 1];
    nextPoint = waypoints[index + 1];

    if (point && previousPoint && nextPoint &&
        getPointDistance(point, nextPoint) === 0 ||
        arePointsOnLine(previousPoint, nextPoint, point, accuracy)) {
      if (Math.abs(previousPoint.x - nextPoint.x) <= accuracy) {
        nextPoint.x = Math.round(nextPoint.x);
        previousPoint.x = nextPoint.x;
      } else if (Math.abs(previousPoint.y - nextPoint.y) <= accuracy) {
        nextPoint.y = Math.round(nextPoint.y);
        previousPoint.y = nextPoint.y;
      }

      // remove point, if overlapping with {nextPoint}
      // or on line with {previousPoint} -> {point} -> {nextPoint}
      waypoints.splice(index, 1);
    } else {
      index++;
    }
  }

  return waypoints;
}
