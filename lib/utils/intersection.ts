import findPathIntersections from 'path-intersection';
import { getPointDistance } from './geometry';
import { Point } from '../types';
import { getCirclePath, getLinePath } from './path';

const INTERSECTION_THRESHOLD = 10;

function getBendpointIntersection(waypoints: Point[], reference: Point) {
  let waypoint;

  for (let index = 0; (waypoint = waypoints[index]); index++) {
    if (getPointDistance(waypoint, reference) <= INTERSECTION_THRESHOLD) {
      return {
        point: waypoints[index],
        bendpoint: true,
        index: index
      };
    }
  }

  return null;
}

function getPathIntersection(waypoints: Point[], reference: Point) {
  const intersections = findPathIntersections(getCirclePath(reference, INTERSECTION_THRESHOLD), getLinePath(waypoints));

  const firstIntersection = intersections[0];
  const lastIntersection = intersections[intersections.length - 1];
  let index;

  if (!firstIntersection) {
    // No intersection
    return null;
  }

  if (firstIntersection !== lastIntersection) {
    if (firstIntersection.segment2 !== lastIntersection.segment2) {
      // We use the bendpoint in between both segments as the intersection point
      index = Math.max(firstIntersection.segment2, lastIntersection.segment2) - 1;

      return {
        point: waypoints[index],
        bendpoint: true,
        index: index,
      };
    }

    return {
      point: {
        x: (Math.round(firstIntersection.x + lastIntersection.x) / 2),
        y: (Math.round(firstIntersection.y + lastIntersection.y) / 2),
      },
      index: firstIntersection.segment2,
    };
  }

  return {
    point: {
      x: Math.round(firstIntersection.x),
      y: Math.round(firstIntersection.y),
    },
    index: firstIntersection.segment2,
  };
}

/**
 * Returns the closest point on the connection towards a given reference point.
 *
 * @param  {Point[]} waypoints
 * @param  {Point} reference
 *
 * @return {Object} intersection data (segment, point)
 */
export function getApproxIntersection(waypoints: Point[], reference: Point) {
  return getBendpointIntersection(waypoints, reference) || getPathIntersection(waypoints, reference);
}

export const findCircleLineIntersections = (circleCenter: Point, radius: number) => (xSlope: number, ySlope: number, intercept: number) => {
  if (xSlope === 0) intercept = intercept + circleCenter.y;
  if (ySlope === 0) intercept = intercept + circleCenter.x;
  // TODO: What about when xSlope !== 0 and ySlope !== 0?

  const x0 = -xSlope * intercept / (xSlope ** 2 + ySlope ** 2);
  const y0 = -ySlope * intercept / (xSlope ** 2 + ySlope ** 2);

  if (intercept ** 2 > (radius ** 2) * (xSlope ** 2 + ySlope ** 2) + Number.EPSILON)
    return [];

  if (Math.abs(intercept ** 2 - (radius ** 2) * (xSlope ** 2 + ySlope ** 2)) < Number.EPSILON)
    return [{ x: x0 + circleCenter.x, y: y0 + circleCenter.y }];

  const distance = radius ** 2 - (intercept ** 2) / (xSlope ** 2 + ySlope ** 2);
  const mult = Math.sqrt(distance / (xSlope ** 2 + ySlope ** 2));

  const ax = x0 + ySlope * mult + circleCenter.x;
  const ay = y0 - xSlope * mult + circleCenter.y;
  const bx = x0 - ySlope * mult + circleCenter.x;
  const by = y0 + xSlope * mult + circleCenter.y;

  return [{ x: ax, y: ay }, { x: bx, y: by }];
}
