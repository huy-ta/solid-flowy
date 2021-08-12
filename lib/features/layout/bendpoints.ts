import { getOrientation } from './orientation';
import { Segment, Point, Orientation, Directions } from '../../types';
import { invertDirections, isExplicitDirections, isValidDirections } from './directions';

const MIN_SEGMENT_LENGTH = 20;
const POINT_ORIENTATION_PADDING = 5;

function needsTurn(orientation: Orientation, startDirection: string) {
  return !{
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /./,
    v: /./
  }[startDirection]!.test(orientation);
}

function canLayoutStraight(direction: string, targetOrientation: Orientation) {
  return {
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /left|right/,
    v: /top|bottom/
  }[direction]!.test(targetOrientation);
}

export function getSegmentBendpoints(sourcePoint: Point, targetPoint: Point, directions: Directions) {
  let orientation = getOrientation({ source: targetPoint, reference: sourcePoint, padding: POINT_ORIENTATION_PADDING });

  let startDirection = directions.split(':')[0];

  const xMid = Math.round((targetPoint.x - sourcePoint.x) / 2 + sourcePoint.x);
  const yMid = Math.round((targetPoint.y - sourcePoint.y) / 2 + sourcePoint.y);

  let segmentEnd, segmentDirections;

  let layoutStraight = canLayoutStraight(startDirection, orientation),
      layoutHorizontal = /h|r|l/.test(startDirection),
      layoutTurn = false;

  let turnNextDirections = false;

  if (layoutStraight) {
    segmentEnd = layoutHorizontal ? { x: xMid, y: sourcePoint.y } : { x: sourcePoint.x, y: yMid };

    segmentDirections = layoutHorizontal ? Directions.HORIZONTAL_HORIZONTAL : Directions.VERTICAL_VERTICAL;
  } else {
    layoutTurn = needsTurn(orientation, startDirection);

    segmentDirections = layoutHorizontal ? Directions.HORIZONTAL_VERTICAL : Directions.VERTICAL_HORIZONTAL;

    if (layoutTurn) {

      if (layoutHorizontal) {
        turnNextDirections = yMid === sourcePoint.y;

        segmentEnd = {
          x: sourcePoint.x + MIN_SEGMENT_LENGTH * (/l/.test(startDirection) ? -1 : 1),
          y: turnNextDirections ? yMid + MIN_SEGMENT_LENGTH : yMid
        };
      } else {
        turnNextDirections = xMid === sourcePoint.x;

        segmentEnd = {
          x: turnNextDirections ? xMid + MIN_SEGMENT_LENGTH : xMid,
          y: sourcePoint.y + MIN_SEGMENT_LENGTH * (/t/.test(startDirection) ? -1 : 1)
        };
      }

    } else {
      segmentEnd = {
        x: xMid,
        y: yMid
      };
    }
  }

  return {
    waypoints: getBendpoints(sourcePoint, segmentEnd, segmentDirections).concat(segmentEnd),
    directions:  segmentDirections,
    turnNextDirections: turnNextDirections
  };
}

export function getStartSegment(a: Point, b: Point, directions: Directions) {
  return getSegmentBendpoints(a, b, directions);
}

export function getEndSegment(a: Point, b: Point, directions: Directions) {
  let invertedSegment = getSegmentBendpoints(b, a, invertDirections(directions));

  return {
    waypoints: invertedSegment.waypoints.slice().reverse(),
    directions: invertDirections(invertedSegment.directions),
    turnNextDirections: invertedSegment.turnNextDirections
  };
}

export function getMidSegment(startSegment: Segment, endSegment: Segment) {
  let startDirection = startSegment.directions.split(':')[1];
  let endDirection = endSegment.directions.split(':')[0];

  if (startSegment.turnNextDirections) {
    startDirection = startDirection == 'h' ? 'v' : 'h';
  }

  if (endSegment.turnNextDirections) {
    endDirection = endDirection == 'h' ? 'v' : 'h';
  }

  let directions = startDirection + ':' + endDirection as Directions;

  let bendpoints = getBendpoints(
    startSegment.waypoints[startSegment.waypoints.length - 1],
    endSegment.waypoints[0],
    directions
  );

  return {
    waypoints: bendpoints,
    directions: directions
  };
}

/**
 * Handle simple layouts with maximum two bendpoints.
 */
export function getSimpleBendpoints(pointA: Point, pointB: Point, directions: Directions) {
  const xMid = Math.round((pointB.x - pointA.x) / 2 + pointA.x);
  const yMid = Math.round((pointB.y - pointA.y) / 2 + pointA.y);

  // one point, right or left from a
  if (directions === Directions.HORIZONTAL_VERTICAL) {
    return [ { x: pointB.x, y: pointA.y } ];
  }

  // one point, above or below a
  if (directions === Directions.VERTICAL_HORIZONTAL) {
    return [ { x: pointA.x, y: pointB.y } ];
  }

  // vertical segment between a and b
  if (directions === Directions.HORIZONTAL_HORIZONTAL) {
    return [
      { x: xMid, y: pointA.y },
      { x: xMid, y: pointB.y }
    ];
  }

  // horizontal segment between a and b
  if (directions === Directions.VERTICAL_VERTICAL) {
    return [
      { x: pointA.x, y: yMid },
      { x: pointB.x, y: yMid }
    ];
  }

  throw new Error('invalid directions: can only handle letians of [hv]:[hv]');
}


/**
 * Returns the mid points for a manhattan connection between two points.
 *
 * @example h:h (horizontal:horizontal)
 *
 * [a]----[x]
 *         |
 *        [x]----[b]
 *
 * @example h:v (horizontal:vertical)
 *
 * [a]----[x]
 *         |
 *        [b]
 *
 * @example h:r (horizontal:right)
 *
 * [a]----[x]
 *         |
 *    [b]-[x]
 *
 * @param  {Point} pointA
 * @param  {Point} pointB
 * @param  {string} directions
 *
 * @return {Point[]}
 */
export function getBendpoints(pointA: Point, pointB: Point, directions: Directions = Directions.HORIZONTAL_HORIZONTAL): Point[] {
  if (!isValidDirections(directions)) {
    throw new Error(
      'unknown directions: <' + directions + '>: ' +
      'must be specified as <start>:<end> ' +
      'with start/end in { h,v,t,r,b,l }'
    );
  }

  // compute explicit directions, involving trbl dockings
  // using a three segmented layouting algorithm
  if (isExplicitDirections(directions)) {
    const startSegment = getStartSegment(pointA, pointB, directions);
    const endSegment = getEndSegment(pointA, pointB, directions);
    const midSegment = getMidSegment(startSegment, endSegment);

    return [...startSegment.waypoints, ...midSegment.waypoints, ...endSegment.waypoints]
  }

  // handle simple [hv]:[hv] cases that can be easily computed
  return getSimpleBendpoints(pointA, pointB, directions);
}
