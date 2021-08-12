import { Directions, LayoutType, Orientation } from '../../types';

export function isValidDirections(directions: string) {
  return directions && /^h|v|t|r|b|l:h|v|t|r|b|l$/.test(directions);
}

export function isExplicitDirections(directions: string) {
  return directions && /t|r|b|l/.test(directions);
}

export function invertDirections(directions: Directions): Directions {
  return directions.split(':').reverse().join(':') as Directions;
}

/**
 * Returns the manhattan directions connecting two rectangles
 * with the given orientation.
 *
 * Will always return the default layout, if it is specific
 * regarding sides already (trbl).
 *
 * @example
 *
 * getDirections('top'); // -> 'v:v'
 * getDirections('intersect'); // -> 't:t'
 *
 * getDirections('top-right', 'v:h'); // -> 'v:h'
 * getDirections('top-right', 'h:h'); // -> 'h:h'
 *
 *
 * @param {Orientation} orientation
 * @param {LayoutType} defaultLayout
 *
 * @return {Directions}
 */
export function getDirections(orientation: Orientation, defaultLayout: LayoutType): Directions {
  // don't override specific trbl directions
  if (isExplicitDirections(defaultLayout)) {
    return defaultLayout as unknown as Directions;
  }

  switch (orientation) {
    case Orientation.INTERSECT:
      return Directions.INTERSECT;

    case Orientation.TOP:
    case Orientation.BOTTOM:
      return Directions.VERTICAL_VERTICAL;

    case Orientation.LEFT:
    case Orientation.RIGHT:
      return Directions.HORIZONTAL_HORIZONTAL;

    // 'top-left'
    // 'top-right'
    // 'bottom-left'
    // 'bottom-right'
    default:
      return defaultLayout as unknown as Directions;
  }
}
