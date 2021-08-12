import { createMemo, Show, Component, ComponentProps } from 'solid-js';
import cc from 'classcat';

import { Edge, EdgeProps } from '../../types';

export interface WrapEdgeProps<T = any> {
  edge: Edge<T>;
  markerEndId?: string;
  handleEdgeUpdate: boolean;
  onClick?: (event: MouseEvent, edge: Edge) => void;
  onDblClick?: (event: MouseEvent, edge: Edge) => void;
  onContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onMouseEnter?: (event: MouseEvent, edge: Edge) => void;
  onMouseMove?: (event: MouseEvent, edge: Edge) => void;
  onMouseLeave?: (event: MouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  storeId: string;
  children?: Element;
}

const wrapEdge = (EdgeComponent: Component<EdgeProps>) => {
  const EdgeWrapper = (wrapEdgeProps: WrapEdgeProps) => {
    const edgeClasses = createMemo(() => cc([
      'solid-flowy__edge',
      `solid-flowy__edge-${wrapEdgeProps.edge.type}`,
      wrapEdgeProps.edge.className,
    ]));

    const edgeElement = createMemo(() => {
      const el: Edge = {
        id: wrapEdgeProps.edge.id,
        source: wrapEdgeProps.edge.source,
        target: wrapEdgeProps.edge.target,
        waypoints: wrapEdgeProps.edge.waypoints,
        type: wrapEdgeProps.edge.type,
      };

      if (typeof wrapEdgeProps.edge.data !== 'undefined') {
        el.data = wrapEdgeProps.edge.data;
      }

      return el;
    });

    const onEdgeClick = (event: MouseEvent): void => {
      wrapEdgeProps.onClick?.(event, edgeElement());
    };

    const onEdgeDblClick = (event: MouseEvent): void => {
      wrapEdgeProps.onDblClick?.(event, edgeElement());
    };

    const onEdgeContextMenu = (event: MouseEvent): void => {
      wrapEdgeProps.onContextMenu?.(event, edgeElement());
    };

    const onEdgeMouseEnter = (event: MouseEvent): void => {
      wrapEdgeProps.onMouseEnter?.(event, edgeElement());
    };

    const onEdgeMouseMove = (event: MouseEvent): void => {
      wrapEdgeProps.onMouseMove?.(event, edgeElement());
    };

    const onEdgeMouseLeave = (event: MouseEvent): void => {
      wrapEdgeProps.onMouseLeave?.(event, edgeElement());
    };

    console.log('wrapEdgeProps.storeId', wrapEdgeProps.storeId);

    return (
      <Show when={!wrapEdgeProps.edge.isHidden} fallback={null}>
        <g
          className={edgeClasses()}
          onClick={onEdgeClick}
          onDblClick={onEdgeDblClick}
          onContextMenu={onEdgeContextMenu}
          onMouseEnter={onEdgeMouseEnter}
          onMouseMove={onEdgeMouseMove}
          onMouseLeave={onEdgeMouseLeave}
        >
          <EdgeComponent
            edge={wrapEdgeProps.edge}
            markerEndId={wrapEdgeProps.markerEndId}
            storeId={wrapEdgeProps.storeId}
          />
        </g>
      </Show>
    );
  };

  return EdgeWrapper;
};

export { wrapEdge };
