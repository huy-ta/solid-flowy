import { getOrientation, invertOrientation } from './orientation';
import { filterRedundantWaypoints } from './waypoints';
import { getMidPointOfRectangle, isPointInRect, getPointDistance, arePointsAligned, isInAxisRange } from '../../utils/geometry';
import { getDirections } from './directions';
import { Point, Rectangle, LayoutType, Directions, Hints, Shape } from '../../types';
import { getBendpoints } from './bendpoints';
import { getDockingPoint } from '../docking';

const INTERSECTION_THRESHOLD = 20;
const ORIENTATION_THRESHOLD = {
  [LayoutType.HORIZONTAL_HORIZONTAL]: 20,
  [LayoutType.VERTICAL_VERTICAL]: 20,
  [LayoutType.HORIZONTAL_VERTICAL]: -10,
  [LayoutType.VERTICAL_HORIZONTAL]: -10,
  [LayoutType.STRAIGHT]: 0,
};

/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param {Point} sourcePoint
 * @param {Point} targetPoint
 *
 * @param {string} [directions='h:h'] Specifies manhattan directions for each point as {adirection}:{bdirection}.
                                      A direction for a point is either `h` (horizontal) or `v` (vertical)
 *
 * @return {Point[]}
 */
export function connectPoints(sourcePoint: Point, targetPoint: Point, directions: Directions = Directions.HORIZONTAL_HORIZONTAL) {
  let points = getBendpoints(sourcePoint, targetPoint, directions);

  points.unshift(sourcePoint);
  points.push(targetPoint);

  return filterRedundantWaypoints(points);
}

const CHANGED_DOCKING_POINT_THRESHOLD = 16;

/**
 * Connect two rectangles using a manhattan layouted connection.
 *
 * @param {Rectangle} sourceShape source shape
 * @param {Rectangle} targetShape target shape
 * @param {Point} [startPoint] source docking
 * @param {Point} [endPoint] target docking
 *
 * @param {Hints} [hints]
 * @param {string} [hints.preserveDocking=source] preserve docking on selected side
 * @param {LayoutType[]} [hints.preferredLayouts]
 * @param {Point|boolean} [hints.connectionStart] whether the start changed
 * @param {Point|boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Point[]} connection points
 */
export function connectShapes(sourceShape: Shape, targetShape: Shape, sourceShapeType: string, targetShapeType: string, startPoint?: Point, endPoint?: Point, hints?: Hints) {
  const preferredLayouts = hints && hints.preferredLayouts || [];
  const preferredLayout = preferredLayouts.filter(layout => layout !== LayoutType.STRAIGHT)[0] || LayoutType.HORIZONTAL_HORIZONTAL;
  const threshold = 0;
  const orientation = getOrientation({ source: sourceShape, sourceShapeType, reference: targetShape, referenceShapeType: targetShapeType, padding: threshold });
  const directions = getDirections(orientation, preferredLayout);

  startPoint = startPoint || getMidPointOfRectangle(sourceShape);
  endPoint = endPoint || getMidPointOfRectangle(targetShape);

  const directionSplit = directions.split(':') as ['h' | 'v', 'h' | 'v'];

  // compute actual docking points for start / end
  // this ensures we properly layout only parts of the
  // connection that lies in between the two rectangles
  const { dockingPoint: startDockingPoint } = getDockingPoint(sourceShapeType)(startPoint, sourceShape, directionSplit[0], invertOrientation(orientation));
  const { dockingPoint: endDockingPoint, changedDockingPoint: changedEndDockingPoint, direction: endDirection } = getDockingPoint(targetShapeType)(endPoint, targetShape, directionSplit[1], orientation);

  if (changedEndDockingPoint && (
    (endDirection === 'b' && getMidPointOfRectangle(sourceShape).y > (targetShape.y + targetShape.height) + CHANGED_DOCKING_POINT_THRESHOLD) ||
    (endDirection === 't' && getMidPointOfRectangle(sourceShape).y < (targetShape.y) - CHANGED_DOCKING_POINT_THRESHOLD)
  )) {
    return connectPoints(startDockingPoint, changedEndDockingPoint, Directions.HORIZONTAL_VERTICAL);
  }

  return connectPoints(startDockingPoint, endDockingPoint, directions);
}

/**
 * Connect a shape to a point using a manhattan layouted connection.
 *
 * @param {Rectangle} sourceShape source shape
 * @param {string} sourceShapeType source shape type
 * @param {Rectangle} targetPoint target point
 * @param {Point} [startPoint] source docking
 *
 * @param {Hints} [hints]
 * @param {string} [hints.preserveDocking=source] preserve docking on selected side
 * @param {LayoutType[]} [hints.preferredLayouts]
 * @param {Point|boolean} [hints.connectionStart] whether the start changed
 * @param {Point|boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Point[]} connection points
 */
export function connectShapeToPoint(sourceShape: Shape, sourceShapeType: string, targetPoint: Point, startPoint?: Point, hints?: Hints) {
  const preferredLayouts = hints && hints.preferredLayouts || [];
  const preferredLayout = preferredLayouts.filter(layout => layout !== LayoutType.STRAIGHT)[0] || LayoutType.HORIZONTAL_HORIZONTAL;
  const threshold = ORIENTATION_THRESHOLD[preferredLayout] || 0;
  const orientation = getOrientation({ source: sourceShape, sourceShapeType, reference: targetPoint, padding: threshold });
  const directions = getDirections(orientation, preferredLayout);

  startPoint = startPoint || getMidPointOfRectangle(sourceShape);

  const directionSplit = directions.split(':') as ['h' | 'v', 'h' | 'v'];

  // compute actual docking points for start / end
  // this ensures we properly layout only parts of the
  // connection that lies in between the two rectangles
  const { dockingPoint: startDockingPoint } = getDockingPoint(sourceShapeType)(startPoint, sourceShape, directionSplit[0], invertOrientation(orientation));

  return connectPoints(startDockingPoint, targetPoint, directions);
}

/**
 * Repair the connection between two rectangles, of which one has been updated.
 *
 * @param {Shape} sourceShape
 * @param {Shape} targetShape
 * @param {string} sourceShapeType
 * @param {string} targetShapeType
 * @param {Point} [startPoint]
 * @param {Point} [endPoint]
 * @param {Point[]} [waypoints]
 * @param {Hints} [hints]
 *
 * @return {Point[]} repaired waypoints
 */
export function repairConnection(sourceShape: Shape, targetShape: Shape, sourceShapeType: string, targetShapeType: string, startPoint?: Point, endPoint?: Point, waypoints: Point[] = [], hints?: Hints) {
  if (Array.isArray(startPoint)) {
    waypoints = startPoint;
    startPoint = getMidPointOfRectangle(sourceShape);
    endPoint = getMidPointOfRectangle(targetShape);
  }

  hints = { preferredLayouts: [], ...hints };

  const { preferredLayouts } = hints;
  const isStraightPreferred = preferredLayouts?.includes(LayoutType.STRAIGHT);

  // just layout non-existing or simple connections
  // attempt to render straight lines, if required

  // attempt to layout a straight line
  let repairedWaypoints = isStraightPreferred && tryLayoutStraightBetweenRectangles(sourceShape, targetShape, startPoint!, endPoint!, hints);

  if (repairedWaypoints) {
    return repairedWaypoints;
  }

  // try to layout from end
  repairedWaypoints = hints.connectionEnd && tryRepairConnectionEnd(targetShape, sourceShape, targetShapeType, sourceShapeType, endPoint!, waypoints);

  if (repairedWaypoints) {
    return filterRedundantWaypoints(repairedWaypoints);
  }

  // try to layout from start
  repairedWaypoints = hints.connectionStart && tryRepairConnectionStart(sourceShape, targetShape, sourceShapeType, targetShapeType, startPoint!, waypoints);

  if (repairedWaypoints) {
    return filterRedundantWaypoints(repairedWaypoints);
  }

  // or whether nothing seems to have changed
  if (!hints.connectionStart && !hints.connectionEnd && waypoints && waypoints.length) {
    return waypoints;
  }

  // simply reconnect if nothing else worked
  return connectShapes(sourceShape, targetShape, sourceShapeType, targetShapeType, startPoint, endPoint, hints);
}

/**
 * Layout a straight connection between two rectangles
 *
 * @param {Rectangle} sourceRectangle
 * @param {Rectangle} targetRectangle
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @param {Object} [hints]
 *
 * @return {Point[]|null} waypoints if straight layout worked
 */
export function tryLayoutStraightBetweenRectangles(sourceRectangle: Rectangle, targetRectangle: Rectangle, startPoint: Point, endPoint: Point, hints?: Hints) {
  let axis: { x?: number, y?: number } = {};
  let primaryAxis: 'x' | 'y';
  let orientation: string;

  orientation = getOrientation({ source: sourceRectangle, reference: targetRectangle });

  // only layout a straight connection if shapes are
  // horizontally or vertically aligned
  if (!/^(top|bottom|left|right)$/.test(orientation)) {
    return null;
  }

  primaryAxis = /top|bottom/.test(orientation) ? 'x' : /left|right/.test(orientation) ? 'y' : 'x';

  if (hints?.preserveDocking === 'target') {
    if (!isInAxisRange(primaryAxis, endPoint, sourceRectangle)) {
      return null;
    }

    axis[primaryAxis] = endPoint[primaryAxis];

    return [
      {
        x: axis.x !== undefined ? axis.x : startPoint.x,
        y: axis.y !== undefined ? axis.y : startPoint.y,
      },
      {
        x: endPoint.x,
        y: endPoint.y
      }
    ];
  }

  if (!isInAxisRange(primaryAxis, startPoint, targetRectangle)) {
    return null;
  }

  axis[primaryAxis] = startPoint[primaryAxis];

  return [
    {
      x: startPoint.x,
      y: startPoint.y
    },
    {
      x: axis.x !== undefined ? axis.x : endPoint.x,
      y: axis.y !== undefined ? axis.y : endPoint.y,
    }
  ];
}

/**
 * Repair a connection from start.
 *
 * @param {Shape} movedShape
 * @param {Shape} otherShape
 * @param {string} movedShapeType
 * @param {string} otherShapeType
 * @param {Point} newDocking
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]|null} the repaired points between the two rectangles
 */
function tryRepairConnectionStart(movedShape: Shape, otherShape: Shape, movedShapeType: string, otherShapeType: string, newDocking: Point, points: Point[]) {
  return _tryRepairConnectionSide(movedShape, otherShape, movedShapeType, otherShapeType, newDocking, points);
}

/**
 * Repair a connection from end.
 *
 * @param {Shape} movedShape
 * @param {Shape} otherShape
 * @param {string} movedShapeType
 * @param {string} otherShapeType
 * @param {Point} newDocking
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]|null} the repaired points between the two rectangles
 */
function tryRepairConnectionEnd(movedShape: Shape, otherShape: Shape, movedShapeType: string, otherShapeType: string, newDocking: Point, points: Point[]) {
  let waypoints = points.slice().reverse();

  waypoints = _tryRepairConnectionSide(movedShape, otherShape, movedShapeType, otherShapeType, newDocking, waypoints) as Point[];

  return waypoints ? waypoints.reverse() : null;
}

/**
 * Repair a connection from one side that moved.
 *
 * @param {Shape} movedShape
 * @param {Shape} otherShape
 * @param {string} movedShapeType
 * @param {string} otherShapeType
 * @param {Point} newDockingPoint
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]} the repaired points between the two rectangles
 */
function _tryRepairConnectionSide(movedShape: Shape, otherShape: Shape, movedShapeType: string, otherShapeType: string, newDockingPoint: Point, points: Point[]) {
  function isRelayoutNeeded(points: Point[]) {
    if (points.length < 3) {
      return true;
    }

    if (points.length > 4) {
      return false;
    }

    // relayout if two points overlap
    // this is most likely due to
    return !!points.find((point, index) => {
      const previousPoint = points[index - 1];

      return previousPoint && getPointDistance(point, previousPoint) < 3;
    });
  }

  function repairBendpoint(candidate: Point, oldPeer: Point, newPeer: Point) {
    const alignment = arePointsAligned(oldPeer, candidate);

    switch (alignment) {
      case 'v':
        // repair horizontal alignment
        return { x: newPeer.x, y: candidate.y };
      case 'h':
        // repair vertical alignment
        return { x: candidate.x, y: newPeer.y };
    }

    return { x: candidate.x, y: candidate.y };
  }

  function removeOverlapping(points: Point[], rectangleA: Rectangle, rectangleB: Rectangle) {
    // intersects (?) break, remove all bendpoints up to this one and relayout
    if (isPointInRect(points[1], rectangleA, INTERSECTION_THRESHOLD) ||
        isPointInRect(points[1], rectangleB, INTERSECTION_THRESHOLD)) {
      // return sliced old connection
      return points.slice(1);
    }

    return points;
  }

  // (0) only repair what has layoutable bendpoints

  // (1) if only one bendpoint and on shape moved onto other shapes axis
  //     (horizontally / vertically), relayout
  if (isRelayoutNeeded(points)) {
    return null;
  }

  let oldDockingPoint = points[0];
  let newPoints = points.slice();
  let slicedPoints;

  // (2) repair only last line segment and only if it was layouted before

  newPoints[0] = newDockingPoint;
  newPoints[1] = repairBendpoint(newPoints[1], oldDockingPoint, newDockingPoint);

  // (3) if shape intersects with any bendpoint after repair,
  //     remove all segments up to this bendpoint and repair from there
  slicedPoints = removeOverlapping(newPoints, movedShape, otherShape);

  if (slicedPoints !== newPoints) {
    newPoints = connectShapes(movedShape, otherShape, movedShapeType, otherShapeType) as Point[];
  }

  // (4) do NOT repair if repaired bendpoints are aligned
  if (newPoints && arePointsAligned(newPoints)) {
    return null;
  }

  return newPoints;
}
