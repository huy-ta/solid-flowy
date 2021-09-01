import { Connection, ApproxIntersection, Axis, EdgeProps } from '../../../types';
import { useStoreById } from '../../../store/state';
import { getCanvas } from '../../../utils/graph';
import { isPrimaryButton } from '../../../utils/mouse';
import { getRectangleFromNode } from '../../../utils/node';
import { getApproxIntersection } from '../../../utils/intersection';
import { eventPointToCanvasCoordinates } from '../../../utils/coordinates';
import {
  Context,
  activateBendpointMove,
  handleDragStopWithContext,
  calculateNewConnectionOnDragging,
} from '../../../features/bendpoints/connectionSegmentMove';
import { Component, createMemo, For, onCleanup, onMount } from 'solid-js';

export interface EdgeWaypoint {
  x: number;
  y: number;
}

const getEdgeSegmentsFromWaypoints = (waypoints: EdgeWaypoint[]) => {
  const pair = [];

  for (let index = 0; index < waypoints.length - 1; index++) {
    pair.push({
      sourceX: waypoints[index].x,
      sourceY: waypoints[index].y,
      targetX: waypoints[index + 1].x,
      targetY: waypoints[index + 1].y,
    });
  }

  return pair;
};

let eventDelta = { x: 0, y: 0 };

const StandardEdgeController: Component<Omit<EdgeProps, 'markerEndId'>> = (props) => {
  const [state, { upsertEdge, setSelectedElementById }] = useStoreById(props.storeId);
  const segments = createMemo(() => getEdgeSegmentsFromWaypoints(props.edge.waypoints as EdgeWaypoint[]));
  let context: Context;
  let isBendpointMoveActive: boolean = false;

  onMount(() => {
    document.addEventListener('mouseup', handleDragStop);
    document.addEventListener('mousemove', handleDrag);

    onCleanup(() => {
      document.removeEventListener('mouseup', handleDragStop);
      document.removeEventListener('mousemove', handleDrag);
    });
  });

  const handleDragStart = (event: MouseEvent) => {
    if (!isPrimaryButton(event)) return;

    const canvas = getCanvas(state.transform);
    const sourceNode = state.nodes[props.edge.source];
    const targetNode = state.nodes[props.edge.target];
    const connection: Connection = {
      waypoints: props.edge.waypoints,
      source: { ...getRectangleFromNode(sourceNode), ...sourceNode.shapeData },
      target: { ...getRectangleFromNode(targetNode), ...targetNode.shapeData },
      sourceShapeType: sourceNode.shapeType,
      targetShapeType: targetNode.shapeType,
    };
    const intersection = getApproxIntersection(
      props.edge.waypoints,
      eventPointToCanvasCoordinates(event)(canvas)
    ) as ApproxIntersection;
    const newContext = activateBendpointMove(connection, intersection);

    eventDelta = { x: 0, y: 0 };

    context = newContext;
    isBendpointMoveActive = true;
  };

  const updateEdgeAndContext = (newConnection: Connection, newContext: Context, isDragging: boolean) => {
    upsertEdge({ ...props.edge, waypoints: newConnection.waypoints, isDragging });

    context = newContext;
  };

  const handleDragStop = () => {
    if (!isBendpointMoveActive) return;

    isBendpointMoveActive = false;

    const { newConnection, newContext } = handleDragStopWithContext(context);

    updateEdgeAndContext(newConnection, newContext, false);
  };

  const handleDrag = (event: MouseEvent) => {
    if (!context || !isBendpointMoveActive) return;

    let movementX: number = event.movementX;
    let movementY: number = event.movementY;

    if (context.axis === Axis.X) {
      eventDelta.x += Math.round(movementX / state.transform[2]);
    } else if (context.axis === Axis.Y) {
      eventDelta.y += Math.round(movementY / state.transform[2]);
    }

    movementX = eventDelta.x;
    movementY = eventDelta.y;

    const { newConnection, newContext } = calculateNewConnectionOnDragging(movementX, movementY)(context);

    updateEdgeAndContext(newConnection, newContext, true);
  };

  const handleSelect = (e: MouseEvent) => {
    e.stopPropagation();

    setSelectedElementById(props.edge.id);
  };

  return (
    <For each={segments()}>
      {(segment) => (
        <polyline
          style={{
            fill: 'none',
            'stroke-opacity': 0,
            stroke: 'white',
            'stroke-width': 15,
            cursor: segment.sourceX === segment.targetX ? 'ew-resize' : 'ns-resize',
            'z-index': 999,
          }}
          points={`${segment.sourceX} ${segment.sourceY}, ${segment.targetX} ${segment.targetY}`}
          onMouseDown={handleDragStart}
          onMouseUp={handleSelect}
        />
      )}
    </For>
  );
};

export default StandardEdgeController;
