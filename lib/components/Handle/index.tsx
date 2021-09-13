import { Component, createSignal, mergeProps } from 'solid-js';

import { ArrowHeadType, Node, Edge, Point, Rectangle, LayoutType } from '../../types';
import { getCanvas } from '../../utils/graph';
import { eventPointToCanvasCoordinates } from '../../utils/coordinates';
import { connectShapes, connectShapeToPoint } from '../../features/layout/manhattanLayout';
import { NodeValidator, useStoreById } from '../../store/state';
import { isPointInShape } from '../../utils/pointInShape';

export interface HandleProps {
  node: Node;
  shouldShowHandle: boolean;
  additionalEdgeProps: Partial<Edge>;
  storeId: string;
}

const Handle: Component<HandleProps> = (props) => {
  props = mergeProps({ additionalEdgeProps: { type: 'standardEdge' } }, props);
  const [state, { upsertEdge, deleteElementById }] = useStoreById(props.storeId)!;
  let previousTargetNode: Node;
  let previousValid: boolean;

  const getFormingEdgeId = () => {
    return `e${props.node.id}-?`;
  };

  const handleDrag = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const sourceRectangle: Rectangle = {
      x: props.node.position.x,
      y: props.node.position.y,
      width: props.node.width!,
      height: props.node.height!,
    };

    const canvas = getCanvas(state.transform);

    const cursorPosition = eventPointToCanvasCoordinates(event)(canvas);

    let targetRectangle: Rectangle;

    const targetNode = Object.values(state.nodes).find((whichNode) => {
      targetRectangle = {
        x: whichNode.position.x,
        y: whichNode.position.y,
        width: whichNode.width!,
        height: whichNode.height!,
      };

      return isPointInShape(whichNode.shapeType)(cursorPosition, { ...targetRectangle, ...whichNode.shapeData });
    });

    let waypoints: Point[];
    let newEdge: Partial<Edge> = {
      id: getFormingEdgeId(),
      source: props.node.id,
      target: '?',
      arrowHeadType: ArrowHeadType.ArrowClosed,
      isForming: true,
      ...props.additionalEdgeProps,
    };

    if (targetNode) {
      waypoints = connectShapes(
        { ...sourceRectangle, ...props.node.shapeData },
        { ...targetRectangle!, ...targetNode.shapeData },
        props.node.shapeType,
        targetNode.shapeType,
        undefined,
        cursorPosition,
        { preferredLayouts: [LayoutType.VERTICAL_VERTICAL] }
      );
      newEdge.target = targetNode.id;
      newEdge.waypoints = waypoints;

      const nodeValidator = state.nodeValidators[props.node.type || 'standardNode'];

      if (typeof nodeValidator === 'function') {
        console.log('previousTargetNode', previousTargetNode);
        console.log('targetNode', targetNode);
        if (!previousTargetNode || (previousTargetNode.id !== targetNode.id)) {
          const { isValid } = (nodeValidator as NodeValidator)(props.node, targetNode, newEdge as Edge);
          console.log('isValid', isValid);
          previousValid = isValid;

          if (!isValid) newEdge.isInvalid = true;
          else newEdge.isInvalid = false;
        } else {
          console.log('previousValid', previousValid);
          if (!previousValid) newEdge.isInvalid = true;
          else newEdge.isInvalid = false;
        }
      }
    } else {
      waypoints = connectShapeToPoint(
        { ...sourceRectangle, ...props.node.shapeData },
        props.node.shapeType,
        cursorPosition
      );
      newEdge.target = '?';
      newEdge.waypoints = waypoints;
    }

    previousTargetNode = targetNode;

    console.log('newEdge', JSON.parse(JSON.stringify(newEdge)));

    upsertEdge(newEdge as Edge);
  };

  const handleDragStop = () => {
    document.body.style.overscrollBehavior = 'unset';

    const formingEdgeId = getFormingEdgeId();
    console.log(`state.edges[${formingEdgeId}]`, { ...state.edges[formingEdgeId] });
    if (state.edges[formingEdgeId]) {
      if (state.edges[formingEdgeId].target !== '?' && !state.edges[formingEdgeId].isInvalid) {
        const newEdge = { ...state.edges[formingEdgeId], id: `e${props.node.id}-${state.edges[formingEdgeId].target}` };

        delete newEdge.isForming;

        upsertEdge(newEdge);
      }

      deleteElementById(formingEdgeId);
    }

    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('mouseup', handleDragStop);
    document.removeEventListener('touchend', handleDragStop);
  };

  const handleDragStart = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    document.body.style.overscrollBehavior = 'none';

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('mouseup', handleDragStop);
    document.addEventListener('touchend', handleDragStop);
  };

  return (
    <div
      classList={{ 'solid-flowy__handle': true, 'solid-flowy__handle--hidden': !props.shouldShowHandle }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {props.children}
    </div>
  );
};

export default Handle;
