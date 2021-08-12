import { Path, Point, Rectangle } from '../types';

export function componentsToPath(elements: (string | number)[][]): Path {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
}

export function getRectanglePath(rectangle: Rectangle): Path {
  const { x, y, width, height } = rectangle;
  const shapePath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return componentsToPath(shapePath);
}

export function getPathFromWaypoints(waypoints: Point[]): Path {
  const connectionPath = waypoints.map((waypoint, index) =>
    [index === 0 ? 'M' : 'L', waypoint.x, waypoint.y]
  );

  return componentsToPath(connectionPath);
}

export function getCirclePath(center: Point, radius: number) {
  const { x, y } = center;

  return [
    ['M', x, y],
    ['m', 0, -radius],
    ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
    ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
    ['z']
  ];
}

export function getLinePath(points: Point[]) {
  const segments: (string | number)[][] = [];

  points.forEach((point, index) => {
    segments.push([ index === 0 ? 'M' : 'L', point.x, point.y ]);
  });

  return segments;
}
