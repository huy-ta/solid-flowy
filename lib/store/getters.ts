import { getSourceTargetNodes } from '../container/EdgeRenderer/utils';
import { Edge, Node } from '../types';
import { useStoreById } from './state';

export const getSelectedElement = (storeId: string) => {
  const [state] = useStoreById(storeId);

  return [...Object.values(state.nodes), ...Object.values(state.edges)].find(element => element.isSelected);
}

export const getOutgoingEdges = (storeId: string) => (node: Node): Edge[] => {
  const [state] = useStoreById(storeId);

  return Object.values(state.edges).filter(edge => edge.source === node.id);
}

export const getIncomingEdges = (storeId: string) => (node: Node): Edge[] => {
  const [state] = useStoreById(storeId);

  return Object.values(state.edges).filter(edge => edge.target === node.id);
}

export const getSourceNode = (storeId: string) => (edge: Edge): Node | undefined => {
  const [state] = useStoreById(storeId);

  return state.nodes[edge.source];
}

export const getTargetNode = (storeId: string) => (edge: Edge): Node | undefined => {
  const [state] = useStoreById(storeId);

  return state.nodes[edge.target];
}

export const getSourceAndTargetNodes = (storeId: string) => (edge: Edge) => {
  const [state] = useStoreById(storeId);

  return getSourceTargetNodes(state.nodes)(edge);
}
