import { Component, createMemo, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { Node, NodeTypesType, Edge, DragDelta } from '../../types';
import { useStoreById } from '../../store/state';
import { WrapNodeProps } from '../../components/Nodes/wrapNode';

interface NodeRendererProps {
  nodeTypes: NodeTypesType<WrapNodeProps>;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onNodeDblClick?: (event: MouseEvent, element: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  snapToGrid: boolean;
  snapGrid: [number, number];
  storeId: string;
}

const NodeRenderer: Component<NodeRendererProps> = (props: NodeRendererProps) => {
  const [state, { updateNodeDimensions }] = useStoreById(props.storeId)!;

  const transformStyle = createMemo(() => ({
    transform: `translate(${state.transform[0]}px,${state.transform[1]}px) scale(${state.transform[2]})`,
  }));

  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries: ResizeObserverEntry[]) => {
          const updates = entries.map((entry: ResizeObserverEntry) => ({
            id: entry.target.getAttribute('data-id') as string,
            nodeElement: entry.target as HTMLDivElement,
          }));

          updateNodeDimensions(updates);
        });

        return (
    <div className="solid-flowy__nodes" style={transformStyle()}>
      <For each={Object.values(state.nodes)}>
        {node => {
          const nodeType = node.type;

          if (!props.nodeTypes[nodeType]) {
            console.warn(`Node type "${nodeType}" not found. Using fallback type "default".`);
          }

          const isDraggable = createMemo(() => !!(node.draggable || (state.nodesDraggable && typeof node.draggable === 'undefined')));
          const isConnectable = createMemo(() => !!(node.connectable || (state.nodesConnectable && typeof node.connectable === 'undefined')));

          return (
            <Dynamic
              component={props.nodeTypes[nodeType]}
              node={node}
              isInitialized={!!node.width || !!node.height}
              snapGrid={props.snapGrid}
              snapToGrid={props.snapToGrid}
              onClick={props.onElementClick}
              onMouseEnter={props.onNodeMouseEnter}
              onMouseMove={props.onNodeMouseMove}
              onMouseLeave={props.onNodeMouseLeave}
              onContextMenu={props.onNodeContextMenu}
              onNodeDblClick={props.onNodeDblClick}
              onNodeDragStart={props.onNodeDragStart}
              onNodeDrag={props.onNodeDrag}
              onNodeDragStop={props.onNodeDragStop}
              scale={state.transform[2]}
              isDraggable={isDraggable()}
              isConnectable={isConnectable()}
              resizeObserver={resizeObserver}
              storeId={props.storeId}
            />
          );
        }}
      </For>
    </div>
  );
};

export default NodeRenderer;
