import { Point } from '../../types';

export function snapToGrid(grid: [number, number], pendingX: number, pendingY: number): [number, number] {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];

  return [x, y];
}

export function offsetXYFromParent(
  clientX: number,
  clientY: number,
  offsetParent: HTMLElement,
  scale: number = 1
): Point {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();

  const x = (clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;

  return { x, y };
}

export function getControlPosition(event: MouseEvent, draggableElement: HTMLElement, scale: number = 1): Point {
  const offsetParent = (draggableElement.offsetParent || draggableElement.ownerDocument.body) as HTMLElement;

  return offsetXYFromParent(event.clientX, event.clientY, offsetParent, scale);
}
