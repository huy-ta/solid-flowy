import { isObject } from 'min-dash';
import { Orientation, Point, Shape } from '../../types';
import { rectangleOrPointAsTRBL, shapeAsTRBL } from '../../utils/trbl';

// orientation utils //////////////////////

export function invertOrientation(orientation: Orientation): Orientation {
  return {
    [Orientation.TOP]: Orientation.BOTTOM,
    [Orientation.BOTTOM]: Orientation.TOP,
    [Orientation.LEFT]: Orientation.RIGHT,
    [Orientation.RIGHT]: Orientation.LEFT,
    [Orientation.TOP_LEFT]: Orientation.BOTTOM_RIGHT,
    [Orientation.BOTTOM_RIGHT]: Orientation.TOP_LEFT,
    [Orientation.TOP_RIGHT]: Orientation.BOTTOM_LEFT,
    [Orientation.BOTTOM_LEFT]: Orientation.TOP_RIGHT,
    [Orientation.INTERSECT]: Orientation.INTERSECT,
  }[orientation];
}

/**
 * Get orientation of the given shape or point with respect to
 * the reference rectangle or point.
 *
 * A padding (positive or negative) may be passed to influence
 * horizontal / vertical orientation and intersection.
 *
 */
export function getOrientation({
  source,
  sourceShapeType = 'rectangle',
  reference,
  referenceShapeType = 'rectangle',
  padding = 0
}: {
  source: Shape | Point,
  sourceShapeType?: string;
  reference: Shape | Point,
  referenceShapeType?: string;
  padding?: Point | number
}): Orientation {
  // make sure we can use an object, too
  // for individual { x, y } padding
  if (!isObject(padding)) {
    padding = { x: padding, y: padding };
  }

  const sourceTRBL = (source as Shape).width ? shapeAsTRBL(sourceShapeType)(source as Shape) : rectangleOrPointAsTRBL(source as Point);
  const referenceTRBL = (reference as Shape).width ? shapeAsTRBL(referenceShapeType)(reference as Shape) : rectangleOrPointAsTRBL(reference as Point);

  const top = sourceTRBL.bottom + padding.y <= referenceTRBL.top;
  const right = sourceTRBL.left - padding.x >= referenceTRBL.right;
  const bottom = sourceTRBL.top - padding.y >= referenceTRBL.bottom;
  const left = sourceTRBL.right + padding.x <= referenceTRBL.left;

  const vertical = top ? Orientation.TOP : (bottom ? Orientation.BOTTOM : null);
  const horizontal = left ? Orientation.LEFT : (right ? Orientation.RIGHT : null);

  if (horizontal && vertical) {
    return `${vertical}-${horizontal}` as Orientation;
  }

  return horizontal || vertical || Orientation.INTERSECT;
}
