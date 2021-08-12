import { Dimensions, NodeExtent, Point } from '../types';

export const isInputDOMNode = (event: MouseEvent | KeyboardEvent) => {
  const target = event?.target as HTMLElement;

  return (
    ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target?.nodeName) || target?.hasAttribute('contenteditable')
  );
};

export const getDimensions = (node: HTMLDivElement): Dimensions => ({
  width: node.offsetWidth,
  height: node.offsetHeight,
});

export const clamp = (val: number, min: number = 0, max: number = 1): number => Math.min(Math.max(val, min), max);

export const clampPosition = (position: Point, extent: NodeExtent) => ({
  x: clamp(position.x, extent[0][0], extent[1][0]),
  y: clamp(position.y, extent[0][1], extent[1][1]),
});

export const getHostForElement = (element: HTMLElement): Document | ShadowRoot =>
  (element.getRootNode?.() as Document | ShadowRoot) || window?.document;

export function isBetween(numberToCheck: number, start: number, end: number) {
  return numberToCheck >= start && numberToCheck <= end;
}
