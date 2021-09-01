import { JSX, Component, createMemo, createEffect, Show, onCleanup } from 'solid-js';

import { DragDelta, Node, SnapGrid, Transform } from '../../types';
import { useStoreById } from '../../store/state';
import Draggable, { DraggableData } from '../Draggable/Draggable';

export interface NodeComponentProps<T = any> {
  node: Node<T>;
  transform?: Transform;
  onClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onMouseEnter?: (node: Node) => void;
  onMouseMove?: (node: Node) => void;
  onMouseLeave?: (node: Node) => void;
  onContextMenu?: (node: Node) => void;
  onNodeDragStart?: (node: Node) => void;
  onNodeDrag?: (node: Node) => void;
  onNodeDragStop?: (node: Node) => void;
  style?: JSX.CSSProperties;
  storeId: string;
}

export interface WrapNodeProps<T = any> {
  node: Node<T>;
  scale: number;
  isDraggable: boolean;
  isConnectable: boolean;
  onClick?: (event: MouseEvent, node: Node) => void;
  onNodeDblClick?: (event: MouseEvent, node: Node) => void;
  onMouseEnter?: (event: MouseEvent, node: Node) => void;
  onMouseMove?: (event: MouseEvent, node: Node) => void;
  onMouseLeave?: (event: MouseEvent, node: Node) => void;
  onContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  style?: JSX.CSSProperties;
  class?: string;
  isInitialized?: boolean;
  snapToGrid?: boolean;
  snapGrid?: SnapGrid;
  resizeObserver: ResizeObserver | null;
  storeId: string;
  children?: Element;
}

const wrapNode = (NodeComponent: Component<NodeComponentProps>) => {
  const NodeWrapper: Component<WrapNodeProps> = (wrapNodeProps) => {
    let observerInitialized: boolean = false;
    let nodeElement: HTMLDivElement;
    const [state, { updateNodeDimensions, updateNodePosDiff }] = useStoreById(wrapNodeProps.storeId);
    const nodeStyle = createMemo(() => ({
      zIndex: 3,
      transform: `translate(${wrapNodeProps.node.position.x}px,${wrapNodeProps.node.position.y}px)`,
      pointerEvents:
        wrapNodeProps.isDraggable ||
        wrapNodeProps.onClick ||
        wrapNodeProps.onMouseEnter ||
        wrapNodeProps.onMouseMove ||
        wrapNodeProps.onMouseLeave
          ? 'all'
          : 'none',
      // prevents jumping of nodes on start
      opacity: wrapNodeProps.isInitialized ? 1 : 0,
      ...wrapNodeProps.style,
    }));

    const onMouseEnterHandler = (event: MouseEvent) => {
      if (wrapNodeProps.node.isDragging) return;

      if (typeof wrapNodeProps.onMouseEnter === 'function') wrapNodeProps.onMouseEnter(event, wrapNodeProps.node);
    };

    const onMouseMoveHandler = (event: MouseEvent) => {
      if (wrapNodeProps.node.isDragging) return;

      if (typeof wrapNodeProps.onMouseMove === 'function') wrapNodeProps.onMouseMove(event, wrapNodeProps.node);
    };

    const onMouseLeaveHandler = (event: MouseEvent) => {
      if (wrapNodeProps.node.isDragging) return;

      if (typeof wrapNodeProps.onMouseLeave === 'function') wrapNodeProps.onMouseLeave(event, wrapNodeProps.node);
    };

    const onContextMenuHandler = (event: MouseEvent) => {
      if (typeof wrapNodeProps.onContextMenu === 'function') wrapNodeProps.onContextMenu(event, wrapNodeProps.node);
    };

    const onNodeDblClickHandler = (event: MouseEvent) => {
      if (typeof wrapNodeProps.onNodeDblClick === 'function') wrapNodeProps.onNodeDblClick(event, wrapNodeProps.node);
    };

    const onDragStart = (event: MouseEvent) => {
      wrapNodeProps.onNodeDragStart?.(event as MouseEvent, wrapNodeProps.node);
    };

    const onDrag = (event: MouseEvent, draggableData: DraggableData) => {
      let deltaX = draggableData.deltaX;
      let deltaY = draggableData.deltaY;

      updateNodePosDiff({
        id: wrapNodeProps.node.id,
        diff: {
          x: deltaX,
          y: deltaY,
        },
        isDragging: true,
      });

      if (typeof wrapNodeProps.onNodeDrag === 'function') {
        wrapNodeProps.onNodeDrag(event, wrapNodeProps.node, { deltaX, deltaY });
      }
    };

    const onDragStop = (event: MouseEvent) => {
      // onDragStop also gets called when user just clicks on a node.
      // Because of that we set dragging to true inside the onDrag handler and handle the click here
      if (!wrapNodeProps.node.isDragging) {
        wrapNodeProps.onClick?.(event, wrapNodeProps.node);

        return;
      }

      updateNodePosDiff({
        id: wrapNodeProps.node.id,
        isDragging: false,
      });

      if (typeof wrapNodeProps.onNodeDragStop === 'function') {
        wrapNodeProps.onNodeDragStop(event, wrapNodeProps.node);
      }
    };

    createEffect(() => {
      // the resize observer calls an updateNodeDimensions initially.
      // We don't need to force another dimension update if it hasn't happened yet
      if (nodeElement && !wrapNodeProps.node.isHidden && observerInitialized) {
        updateNodeDimensions([{ id: wrapNodeProps.node.id, nodeElement, forceUpdate: true }]);
      }
    });

    createEffect(() => {
      if (!nodeElement) return;

      observerInitialized = true;
      const currNode = nodeElement;
      wrapNodeProps.resizeObserver?.observe(currNode);

      onCleanup(() => wrapNodeProps.resizeObserver?.unobserve(currNode));
    });

    return (
      <Show when={!wrapNodeProps.node.isHidden} fallback={null}>
        <Draggable
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragStop={onDragStop}
          snapGrid={wrapNodeProps.snapGrid}
          scale={wrapNodeProps.scale}
          disabled={!wrapNodeProps.isDraggable}
        >
          <div
            classList={{
              'solid-flowy__node': true,
              [`solid-flowy__node-${wrapNodeProps.node.type}`]: true,
              [wrapNodeProps.class]: true,
            }}
            ref={nodeElement}
            style={nodeStyle()}
            onMouseEnter={onMouseEnterHandler}
            onMouseMove={onMouseMoveHandler}
            onMouseLeave={onMouseLeaveHandler}
            onContextMenu={onContextMenuHandler}
            onDblClick={onNodeDblClickHandler}
            data-id={wrapNodeProps.node.id}
          >
            <NodeComponent node={wrapNodeProps.node} storeId={wrapNodeProps.storeId} />
          </div>
        </Draggable>
      </Show>
    );
  };

  return NodeWrapper;
};

export { wrapNode };
