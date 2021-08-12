import { Component, createEffect, createMemo, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import { Edge, Node, Transform } from '../../types';
import { useStoreById } from '../../store/state';

interface EdgeRendererProps {
  edgeTypes: Record<string, Component<EdgeComponentProps>>;
  markerEndId?: string;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onEdgeDoubleClick?: (event: MouseEvent, edge: Edge) => void;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  storeId: string;
}

interface EdgeComponentProps {
  edge: Edge;
  markerEndId?: string;
  onClick?: (event: MouseEvent, element: Node | Edge) => void;
  onDoubleClick?: (event: MouseEvent, edge: Edge) => void;
  onContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onMouseEnter?: (event: MouseEvent, edge: Edge) => void;
  onMouseMove?: (event: MouseEvent, edge: Edge) => void;
  onMouseLeave?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  storeId: string;
}

interface EdgeWrapperProps {
  edge: Edge;
  edgeRendererProps: EdgeRendererProps;
  transform: Transform;
  width: number;
  height: number;
}

const EdgeWrapper: Component<EdgeWrapperProps> = (props) => {
  const [state] = useStoreById(props.edgeRendererProps.storeId);
  const sourceTargetNodeMemo = createMemo(() => getSourceTargetNodes(state.nodes)(props.edge));

  createEffect(() => {
    if (!sourceTargetNodeMemo().sourceNode) {
      console.warn(`Couldn't create edge for source id: ${props.edge.source}; edge id: ${props.edge.id}`);
    }
  });

  const edgeType = createMemo(() => props.edge.type || 'standardEdge');

  console.log('props.edgeRendererProps.storeId', props.edgeRendererProps.storeId);

  return (
    <Show when={sourceTargetNodeMemo().sourceNode && sourceTargetNodeMemo().sourceNode.width} fallback={null}>
      <Dynamic
        component={props.edgeRendererProps.edgeTypes[edgeType()]}
        edge={props.edge}
        onClick={props.edgeRendererProps.onElementClick}
        markerEndId={props.edgeRendererProps.markerEndId}
        onContextMenu={props.edgeRendererProps.onEdgeContextMenu}
        onMouseEnter={props.edgeRendererProps.onEdgeMouseEnter}
        onMouseMove={props.edgeRendererProps.onEdgeMouseMove}
        onMouseLeave={props.edgeRendererProps.onEdgeMouseLeave}
        edgeUpdaterRadius={props.edgeRendererProps.edgeUpdaterRadius}
        onDoubleClick={props.edgeRendererProps.onEdgeDoubleClick}
        storeId={props.edgeRendererProps.storeId}
      />
    </Show>
  );
};

const EdgeRenderer: Component<EdgeRendererProps> = (props) => {
  const [state] = useStoreById(props.storeId);

  const transformStyle = createMemo(
    () => `translate(${state.transform[0]},${state.transform[1]}) scale(${state.transform[2]})`
  );

  return (
    <Show when={state.width} fallback={null}>
      <svg width={state.width} height={state.height} className="solid-flowy__edges">
        <MarkerDefinitions />
        <g className="solid-flowy__edges__transformer" transform={transformStyle()}>
          <For each={Object.values(state.edges)}>
            {(edge) => (
              <EdgeWrapper
                edge={edge}
                edgeRendererProps={props}
                transform={state.transform}
                width={state.width}
                height={state.height}
              />
            )}
          </For>
        </g>
      </svg>
    </Show>
  );
};

export default EdgeRenderer;
