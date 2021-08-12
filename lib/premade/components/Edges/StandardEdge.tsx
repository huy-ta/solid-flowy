import { Component, createMemo } from 'solid-js';
import cc from 'classcat';

import { getMarkerEnd } from '../../../utils/edge';
import { ArrowHeadType, EdgeProps } from '../../../types';
import { getPathFromWaypoints } from '../../../utils/path';
import StandardEdgeController from './StandardEdgeController';

const StandardEdge: Component<EdgeProps> = (props) => {
  const markerEnd = createMemo(() => getMarkerEnd(props.edge.arrowHeadType));
  const errorMarkerEnd = createMemo(() => getMarkerEnd(`${props.edge.arrowHeadType}--error` as ArrowHeadType));
  console.log('StandardEdge props', { ...props });
  console.log('even here? props.storeId', props.storeId);
  return (
    <>
      <path
        style={props.edge.style}
        className={cc([
          'solid-flowy__edge-path',
          {
            'solid-flowy__edge-path--forming': props.edge.isForming,
            'solid-flowy__edge-path--selected': props.edge.isSelected,
            'solid-flowy__edge-path--invalid': props.edge.isInvalid,
          },
        ])}
        d={getPathFromWaypoints(props.edge.waypoints) as string}
        marker-end={props.edge.isInvalid ? errorMarkerEnd() : markerEnd()}
      />
      {!props.edge.isForming && <StandardEdgeController edge={props.edge} storeId={props.storeId} />}
    </>
  );
};

export default StandardEdge;
