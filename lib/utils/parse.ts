import { clampPosition } from '.';
import { Edge, Elements, Node, NodeExtent } from '../types';

export const parseNode = (node: Node, nodeExtent: NodeExtent): Node => {
  const parsedNode = {
    ...node,
    id: node.id.toString(),
    type: node.type,
    position: clampPosition(node.position, nodeExtent),
    isDragging: false,
  };

  delete parsedNode.width;
  delete parsedNode.height;

  return parsedNode;
};

export const parseEdge = (edge: Edge): Edge => {
  return {
    ...edge,
    source: edge.source.toString(),
    target: edge.target.toString(),
    id: edge.id.toString(),
    type: edge.type || 'standardEdge',
  };
};


export const parseElements = (nodes: Node[], edges: Edge[]): Elements => {
  return [
    ...nodes.map(node => ({ ...node })),
    ...edges.map(edge => ({ ...edge })),
  ];
};
