import { Component, splitProps } from 'solid-js';

import { useStoreById } from '../../store/state';
import { getRectangleFromNode } from '../../utils/node';
import { repairConnection } from '../../features/layout/manhattanLayout';
import SolidFlowy, { SolidFlowyProps } from '../../container/SolidFlowy';

const DraggableSolidFlowy: Component<SolidFlowyProps> = (props) => {
  const [state, { upsertEdge }] = useStoreById(props.storeId)!;

  const handleNodeDrag: SolidFlowyProps['onNodeDrag'] = (event, node, dragDelta) => {
    Object.values(state.edges).forEach((edge) => {
      if (edge.target !== node.id && edge.source !== node.id) return edge;

      const otherNode = edge.target === node.id ? state.nodes[edge.source] : state.nodes[edge.target];

      const nodeRectangle = getRectangleFromNode(state.nodes[node.id]);
      const otherNodeRectangle = getRectangleFromNode(state.nodes[otherNode!.id]);

      const newStart = {
        x: edge.waypoints[0].x + dragDelta.deltaX,
        y: edge.waypoints[0].y + dragDelta.deltaY,
      };

      const newEnd = {
        x: edge.waypoints[edge.waypoints.length - 1].x + dragDelta.deltaX,
        y: edge.waypoints[edge.waypoints.length - 1].y + dragDelta.deltaY,
      };

      upsertEdge({
        ...edge,
        isDragging: true,
        waypoints:
          edge.source === node.id
            ? repairConnection(
                { ...nodeRectangle, ...node.shapeData },
                { ...otherNodeRectangle, ...otherNode!.shapeData },
                node.shapeType,
                otherNode!.shapeType,
                newStart,
                undefined,
                edge.waypoints,
                { connectionStart: true }
              )
            : repairConnection(
                { ...otherNodeRectangle, ...otherNode!.shapeData },
                { ...nodeRectangle, ...node.shapeData },
                otherNode!.shapeType,
                node.shapeType,
                undefined,
                newEnd,
                edge.waypoints,
                { connectionEnd: true }
              ),
      });
    });

    if (typeof props.onNodeDrag === 'function') props.onNodeDrag(event, node, dragDelta);
  };

  const handleNodeDragStop: SolidFlowyProps['onNodeDragStop'] = (event, node) => {
    Object.values(state.edges).forEach((edge) => {
      if (edge.target !== node.id && edge.source !== node.id) return edge;

      if (edge.isDragging) upsertEdge({ ...edge, isDragging: false });
    });

    if (typeof props.onNodeDragStop === 'function') props.onNodeDragStop(event, node);
  };

  return (
    <SolidFlowy
      ref={props.ref}
      onNodeDrag={handleNodeDrag}
      onNodeDragStop={handleNodeDragStop}
      onLoad={props.onLoad}
      edgeTypes={props.edgeTypes}
      nodeTypes={props.nodeTypes}
      snapGrid={props.snapGrid}
      snapToGrid={props.snapToGrid}
      storeId={props.storeId}
    >
      {props.children}
    </SolidFlowy>
  );
};

export default DraggableSolidFlowy;
