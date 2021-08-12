import { arePointsAligned, arePointsOnLine, getMidPointOfRectangle } from '../../utils/geometry';
import { getOrientation } from '../layout/orientation';
import { Rectangle, Point, Axis, Connection, ApproxIntersection, Orientation } from '../../types';
import { getCroppedWaypoints } from './croppingConnectionDocking';

function axisAdd(point: Point, axis: Axis, delta: number): Point {
  return axisSet(point, axis, point[axis] + delta);
}

function axisSet(point: Point, axis: Axis, value: number): Point {
  return {
    x: (axis === Axis.X ? value : point.x),
    y: (axis === Axis.Y ? value : point.y),
  };
}

function flipAxis(axis: Axis): Axis {
  return axis === Axis.X ? Axis.Y : Axis.X;
}

export interface Context {
  connection: Connection;
  segmentStartIndex: number;
  newSegmentStartIndex: number;
  segmentEndIndex: number;
  segmentStart: Point;
  segmentEnd: Point;
  axis: Axis;
  dragPosition: Point;
  originalWaypoints: Point[];
  newWaypoints: Point[];
}

/**
 * Get the docking point on the given element.
 *
 * Compute a reasonable docking, if non exists.
 *
 * @param  {Point} point
 * @param  {Rectangle} referenceElement
 * @param  {Axis} moveAxis
 *
 * @return {Point}
 */
function getDocking(point: Point, referenceElement: Rectangle, moveAxis: Axis): Point {
  const referenceMidPoint = getMidPointOfRectangle(referenceElement);
  const inverseAxis = flipAxis(moveAxis);

  return axisSet(point, inverseAxis, referenceMidPoint[inverseAxis]);
}

export const activateBendpointMove = (connection: Connection, intersection: ApproxIntersection) => {
  const segmentStartIndex = intersection.index - 1;
  const segmentEndIndex = intersection.index;
  let segmentStart = connection.waypoints[segmentStartIndex];
  let segmentEnd = connection.waypoints[segmentEndIndex];

  const direction = arePointsAligned(segmentStart, segmentEnd);

  // do not move diagonal connection
  if (!direction) {
    return;
  }

  // the axis where we are going to move things
  const axis = direction === 'v' ? Axis.X : Axis.Y;

  if (segmentStartIndex === 0) {
    segmentStart = getDocking(segmentStart, connection.source, axis);
  }

  if (segmentEndIndex === connection.waypoints.length - 1) {
    segmentEnd = getDocking(segmentEnd, connection.target, axis);
  }

  let dragPosition: Point;

  if (intersection) {
    dragPosition = intersection.point;
  } else {

    // set to segment center as default
    dragPosition = {
      x: (segmentStart.x + segmentEnd.x) / 2,
      y: (segmentStart.y + segmentEnd.y) / 2
    };
  }

  const context: Context = {
    connection,
    segmentStartIndex,
    newSegmentStartIndex: segmentStartIndex,
    segmentEndIndex,
    segmentStart,
    segmentEnd,
    axis,
    dragPosition,
    originalWaypoints: connection.waypoints,
    newWaypoints: connection.waypoints,
  };

  return context;
};

/**
 * Crop connection if connection cropping is provided.
 *
 * @param {Connection} connection
 * @param {Point[]} newWaypoints
 *
 * @return {Point[]} cropped connection waypoints
 */
function cropConnection(connection: Connection, newWaypoints: Point[]) {
  const oldWaypoints = connection.waypoints;

  // Temporary set new waypoints
  connection.waypoints = newWaypoints;

  const croppedWaypoints = getCroppedWaypoints(connection.waypoints, connection.source, connection.target, connection.sourceShapeType, connection.targetShapeType);

  // Restore old waypoints
  connection.waypoints = oldWaypoints;

  return croppedWaypoints;
}

/**
 * Filter waypoints for redundant ones (i.e. on the same axis).
 * Returns the filtered waypoints and the offset related to the segment move.
 *
 * @param {Point[]} waypoints
 * @param {number} segmentStartIndex of moved segment start
 *
 * @return {Object} { filteredWaypoints, segmentOffset }
 */
function filterRedundantWaypoints(waypoints: Point[], segmentStartIndex: number, accuracy = 5) {
  let segmentOffset = 0;

  const filteredWaypoints = waypoints.filter(function(waypoint, index) {
    if (arePointsOnLine(waypoints[index - 1], waypoints[index + 1], waypoint)) {
      // remove point and increment offset
      segmentOffset = index <= segmentStartIndex ? segmentOffset - 1 : segmentOffset;

      if (Math.abs(waypoints[index - 1].x - waypoints[index + 1].x) <= accuracy) {
        waypoints[index + 1].x = Math.round(waypoints[index + 1].x);
        waypoints[index - 1].x = waypoints[index + 1].x;
      } else if (Math.abs(waypoints[index - 1].y - waypoints[index + 1].y) <= accuracy) {
        waypoints[index + 1].y = Math.round(waypoints[index + 1].y);
        waypoints[index - 1].y = waypoints[index + 1].y;
      }

      return false;
    }

    // dont remove point
    return true;
  });

  return {
    waypoints: filteredWaypoints,
    newSegmentOffset: segmentOffset
  };
}

export const calculateNewConnectionOnDragging = (movementX: number, movementY: number) => (context: Context) => {
  const getMovement = (axis: Axis): number => axis === Axis.X ? movementX : movementY;

  const { connection, segmentStartIndex, segmentEndIndex, segmentStart, segmentEnd, axis, originalWaypoints } = context;
  const newWaypoints = originalWaypoints.slice();
  const newSegmentStart = axisAdd(segmentStart, axis, getMovement(axis));
  const newSegmentEnd = axisAdd(segmentEnd, axis, getMovement(axis));

  // original waypoint count and added / removed
  // from start waypoint delta. We use the later
  // to retrieve the updated segmentStartIndex / segmentEndIndex
  const waypointCount = newWaypoints.length;
  let segmentOffset = 0;

  // move segment start / end by axis delta
  newWaypoints[segmentStartIndex] = newSegmentStart;
  newWaypoints[segmentEndIndex] = newSegmentEnd;

  let sourceToSegmentOrientation: Orientation;
  let targetToSegmentOrientation: Orientation;

  // handle first segment
  if (segmentStartIndex < 2) {
    sourceToSegmentOrientation = getOrientation({ source: connection.source, sourceShapeType: connection.sourceShapeType, reference: newSegmentStart });

    // first bendpoint, remove first segment if intersecting
    if (segmentStartIndex === 1) {

      if (sourceToSegmentOrientation === Orientation.INTERSECT) {
        newWaypoints.shift();
        newWaypoints[0] = newSegmentStart;
        segmentOffset--;
      }
    }

    // docking point, add segment if not intersecting anymore
    else {
      if (sourceToSegmentOrientation !== Orientation.INTERSECT) {
        newWaypoints.unshift(segmentStart);
        segmentOffset++;
      }
    }
  }

  // handle last segment
  if (segmentEndIndex > waypointCount - 3) {
    targetToSegmentOrientation = getOrientation({ source: connection.target, sourceShapeType: connection.targetShapeType, reference: newSegmentEnd });

    // last bendpoint, remove last segment if intersecting
    if (segmentEndIndex === waypointCount - 2) {
      if (targetToSegmentOrientation === Orientation.INTERSECT) {
        newWaypoints.pop();
        newWaypoints[newWaypoints.length - 1] = newSegmentEnd;
      }
    }

    // last bendpoint, add segment if not intersecting anymore
    else {
      if (targetToSegmentOrientation !== Orientation.INTERSECT) {
        newWaypoints.push(segmentEnd);
      }
    }
  }

  // update connection waypoints
  const newSegmentStartIndex = segmentStartIndex + segmentOffset;
  const newConnection = { ...connection, waypoints: [...newWaypoints] };
  const croppedWaypoints = cropConnection(connection, newWaypoints);

  newConnection.waypoints = croppedWaypoints;

  const newContext = { ...context, newSegmentStartIndex, newWaypoints: croppedWaypoints };

  return { newConnection, newContext };
};

export const handleDragStopWithContext = (context: Context) => {
  let { connection, newWaypoints, newSegmentStartIndex } = context;

  const { waypoints: filteredWaypoints, newSegmentOffset } = filterRedundantWaypoints(newWaypoints, newSegmentStartIndex);

  const croppedWaypoints = cropConnection(connection, filteredWaypoints);
  const newConnection = { ...connection, waypoints: [...croppedWaypoints] };

  const newContext = { ...context, newSegmentStartIndex: context.newSegmentStartIndex + newSegmentOffset };

  return { newConnection, newContext };
}
