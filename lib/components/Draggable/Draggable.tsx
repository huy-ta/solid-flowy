import { Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { SnapGrid } from '../../types';
import { getControlPosition, snapToGrid } from './utils';

export interface DraggableData {
  node: HTMLElement;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
  x: number;
  y: number;
}

interface DraggableProps {
  componentAs?: string;
  snapGrid?: SnapGrid;
  scale?: number;
  allowAnyClick?: boolean;
  disabled?: boolean;
  onDragStart?: (event: MouseEvent, data: DraggableData) => void;
  onDrag?: (event: MouseEvent, data: DraggableData) => void;
  onDragStop?: (event: MouseEvent, data: DraggableData) => void;
}

const Draggable: Component<DraggableProps> = (props) => {
  let node: HTMLDivElement;
  let isDragging: boolean = false;
  let lastX: number;
  let lastY: number;

  const handleDragStart = (event: MouseEvent) => {
    // Only allows left clicks
    if (!props.allowAnyClick && typeof event.button === 'number' && event.button !== 0) return false;

    const { x, y } = getControlPosition(event, node, props.scale);

    const dragFunctionData = {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y,
    };

    if (typeof props.onDragStart === 'function') props.onDragStart(event, dragFunctionData);

    isDragging = true;
    lastX = x;
    lastY = y;

    document.addEventListener('mousemove', handleDrag);
  };

  const handleDrag = (event: MouseEvent) => {
    let { x, y } = getControlPosition(event, node, props.scale);

    let deltaX = x - lastX;
    let deltaY = y - lastY;

    if (Array.isArray(props.snapGrid)) {
      [deltaX, deltaY] = snapToGrid(props.snapGrid, deltaX, deltaY);

      if (!deltaX && !deltaY) return;

      x = lastX + deltaX;
      y = lastY + deltaY;
    }

    const dragFunctionData = {
      node,
      deltaX,
      deltaY,
      lastX,
      lastY,
      x,
      y,
    };

    if (typeof props.onDrag === 'function') props.onDrag(event, dragFunctionData);

    lastX = x;
    lastY = y;
  };

  const handleDragStop = (event: MouseEvent) => {
    if (!isDragging) return;

    let { x, y } = getControlPosition(event, node, props.scale);

    const deltaX = x - lastX;
    const deltaY = y - lastY;

    const dragFunctionData = {
      node,
      deltaX,
      deltaY,
      lastX,
      lastY,
      x,
      y,
    };

    if (typeof props.onDragStop === 'function') props.onDragStop(event, dragFunctionData);

    isDragging = false;
    lastX = NaN;
    lastY = NaN;

    document.removeEventListener('mousemove', handleDrag);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (props.disabled) return;

    handleDragStart(event);
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (props.disabled) return;

    handleDragStop(event);
  };

  return (
    <div className="draggable" ref={node} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      {props.children}
    </div>
  );
};

export default Draggable;
