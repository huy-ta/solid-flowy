import StandardHandles, { ARROW_DISTANCE, StandardHandlesProps } from '../Handles/StandardHandles';
import { Edge, Node } from '../../../types';
import { isPointInRect } from '../../../utils/geometry';
import { useStoreById } from '../../../store/state';
import { Component, createEffect, createSignal, mergeProps, onCleanup, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export interface NodeContainerWithStandardHandlesProps {
  node: Node;
  additionalEdgeProps?: Partial<Edge>;
  isHandleDisabled?: boolean;
  arrowDistance?: number;
  handles?: string | Component<StandardHandlesProps>;
  topHandleIndicator?: string | Component;
  rightHandleIndicator?: string | Component;
  bottomHandleIndicator?: string | Component;
  leftHandleIndicator?: string | Component;
  storeId: string;
}

const NodeContainer: Component<NodeContainerWithStandardHandlesProps> = (props) => {
  props = mergeProps(
    {
      additionalEdgeProps: { type: 'standardEdge' },
      arrowDistance: ARROW_DISTANCE,
      handles: StandardHandles,
      topHandleIndicator: 'div',
      rightHandleIndicator: 'div',
      bottomHandleIndicator: 'div',
      leftHandleIndicator: 'div',
    },
    props
  );
  const [state, { setSelectedElementById }] = useStoreById(props.storeId);
  const [isMouseDowned, setIsMouseDowned] = createSignal(false);
  const [shouldShowHandles, setShouldShowHandles] = createSignal(false);
  let touchTimeout: number;
  let initialTouch: Touch;
  let containerRef: HTMLDivElement;

  const handleMouseEnter = () => {
    setShouldShowHandles(true);
  };

  createEffect(() => {
    if (!shouldShowHandles()) return;

    document.addEventListener('mousemove', handleMouseMove);

    onCleanup(() => document.removeEventListener('mousemove', handleMouseMove));
  });

  createEffect(() => {
    if (!isMouseDowned()) return;

    document.addEventListener('mouseup', handleMouseUp);

    onCleanup(() => document.removeEventListener('mouseup', handleMouseUp));
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (isMouseDowned()) {
      if (shouldShowHandles) setShouldShowHandles(false);

      return;
    }

    const TOLERANCE = 12;
    const containerBoundingRect = containerRef.getBoundingClientRect();
    const virtualBoundingRect = {
      x: containerBoundingRect.x - (props.arrowDistance + TOLERANCE),
      y: containerBoundingRect.y - (props.arrowDistance + TOLERANCE),
      width: containerBoundingRect.width + 2 * (props.arrowDistance + TOLERANCE),
      height: containerBoundingRect.height + 2 * (props.arrowDistance + TOLERANCE),
    };

    if (!isPointInRect({ x: e.clientX, y: e.clientY }, virtualBoundingRect)) {
      setShouldShowHandles(false);
    }
  };

  const handleMouseDown = () => {
    setIsMouseDowned(true);
  };

  const handleMouseUp = (event: MouseEvent) => {
    const containerBoundingRect = containerRef.getBoundingClientRect();

    if (isPointInRect({ x: event.clientX, y: event.clientY }, containerBoundingRect)) {
      setShouldShowHandles(true);
    }

    setIsMouseDowned(false);
  };

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    setSelectedElementById(props.node.id);
  };

  const handleTouchStart = (event: TouchEvent) => {
    initialTouch = event.touches[0];

    touchTimeout = window.setTimeout(() => {
      setShouldShowHandles(true);
    }, 250);
  };

  const handleTouchEnd = () => {
    if (touchTimeout) clearTimeout(touchTimeout);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches[0].clientX - initialTouch.clientX < 20 && event.touches[0].clientY - initialTouch.clientY < 20) {
      return;
    }

    if (touchTimeout) clearTimeout(touchTimeout);
  };

  return (
    <div
      ref={containerRef}
      classList={{
        'solid-flowy__node-container-with-standard-handles': true,
        'solid-flowy__node-container-with-standard-handles--selected': props.node.isSelected,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      <Show when={!props.isHandleDisabled}>
        <Dynamic
          component={props.handles}
          node={props.node}
          additionalEdgeProps={props.additionalEdgeProps}
          shouldShowHandles={shouldShowHandles()}
          topHandleIndicator={props.topHandleIndicator}
          rightHandleIndicator={props.rightHandleIndicator}
          bottomHandleIndicator={props.bottomHandleIndicator}
          leftHandleIndicator={props.leftHandleIndicator}
          storeId={props.storeId}
        />
      </Show>
      {props.children}
    </div>
  );
};

export default NodeContainer;
