import { JSX, Component, createMemo, createEffect, Show, onCleanup } from 'solid-js';
import cc from 'classcat';

import { DragDelta, Node, SnapGrid, Transform } from '../../types';
import { useStoreById } from '../../store/state';

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
  className?: string;
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
    const [state, { updateNodeDimensions }] = useStoreById(wrapNodeProps.storeId);
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

    const nodeClasses = cc([
      'solid-flowy__node',
      `solid-flowy__node-${wrapNodeProps.node.type}`,
      wrapNodeProps.className,
    ]);

    return (
      <Show when={!wrapNodeProps.node.isHidden} fallback={null}>
        <div
          className={nodeClasses}
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
      </Show>
    );
  };

  return NodeWrapper;
};

export { wrapNode };
