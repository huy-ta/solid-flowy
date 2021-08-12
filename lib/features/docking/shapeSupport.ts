import { Point, Shape } from '../../types';
import { findCircleLineIntersections } from '../../utils/intersection';

export function getDockingPointForRectangle(point: Point, shape: Shape, detailedDockingDirection: 't' | 'r' | 'b' | 'l') {
  point = { ...point, x: Math.round(point.x), y: Math.round(point.y) };

  const relativeXPosToRectangleRatio = Math.abs(point.x - shape.x) / shape.width;
  const relativeYPosToRectangleRatio = Math.abs(point.y - shape.y) / shape.height;

  if (detailedDockingDirection === 't') {
    return {
      dockingPoint: { x: point.x, y: shape.y },
      direction: 't',
    };
  }

  if (detailedDockingDirection === 'r') {
    if (relativeXPosToRectangleRatio <= 0.9) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { x: shape.x + shape.width, y: point.y },
          changedDockingPoint: { x: point.x, y: shape.y + shape.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { x: shape.x + shape.width, y: point.y },
          changedDockingPoint: { x: point.x, y: shape.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { x: shape.x + shape.width, y: point.y },
      direction: 'r',
    };
  }

  if (detailedDockingDirection === 'b') {
    return {
      dockingPoint: { x: point.x, y: shape.y + shape.height },
      direction: 'b',
    }
  }

  if (detailedDockingDirection === 'l') {
    if (relativeXPosToRectangleRatio >= 0.1) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { x: shape.x, y: point.y },
          changedDockingPoint: { x: point.x, y: shape.y + shape.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { x: shape.x, y: point.y },
          changedDockingPoint: { x: point.x, y: shape.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { x: shape.x, y: point.y },
      direction: 'l',
    };
  }

  throw new Error('Unexpected dockingDirection: <' + detailedDockingDirection + '>');
}

export function getDockingPointForCircle(point: Point, shape: Shape, detailedDockingDirection: 't' | 'r' | 'b' | 'l') {
  point = { ...point, x: Math.round(point.x), y: Math.round(point.y) };

  const circleCenter = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
  const radius = shape.width / 2;

  if (detailedDockingDirection === 't') {
    if (point.x < shape.x) point = { x: shape.x, y: point.y };
    else if (point.x > shape.x + shape.width) point = { x: shape.x + shape.width, y: point.y };

    return {
      dockingPoint: { ...findCircleLineIntersections(circleCenter, radius)(1, 0, -point.x)[0] },
      direction: 't',
    };
  }

  if (detailedDockingDirection === 'r') {
    if (point.y < shape.y) point = { x: point.x, y: shape.y };
    else if (point.y > shape.y + shape.height) point = { x: point.x, y: shape.y + shape.height };

    return {
      dockingPoint: { ...findCircleLineIntersections(circleCenter, radius)(0, 1, -point.y)[0] },
      direction: 'r',
    };
  }

  if (detailedDockingDirection === 'b') {
    if (point.x < shape.x) point = { x: shape.x, y: point.y };
    else if (point.x > shape.x + shape.width) point = { x: shape.x + shape.width, y: point.y };

    const intersections = findCircleLineIntersections(circleCenter, radius)(1, 0, -point.x);

    return {
      dockingPoint: { ...(intersections[1] || intersections[0]) },
      direction: 'b',
    };
  }

  if (detailedDockingDirection === 'l') {
    if (point.y < shape.y) point = { x: point.x, y: shape.y };
    else if (point.y > shape.y + shape.height) point = { x: point.x, y: shape.y + shape.height };

    const intersections = findCircleLineIntersections(circleCenter, radius)(0, 1, -point.y);

    return {
      dockingPoint: { ...(intersections[1] || intersections[0]) },
      direction: 'l',
    };
  }

  throw new Error('Unexpected dockingDirection: <' + detailedDockingDirection + '>');
}
