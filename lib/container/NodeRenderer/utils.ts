import { Component } from 'solid-js';

import { wrapNode, NodeComponentProps } from '../../components/Nodes/wrapNode';
import { NodeTypesType } from '../../types';

export function createNodeTypes(nodeTypes: NodeTypesType): NodeTypesType {
  const wrappedTypes = {} as NodeTypesType;

  return Object.keys(nodeTypes).reduce((res, key) => {
    res[key] = wrapNode(nodeTypes[key] as Component<NodeComponentProps>);

    return res;
  }, wrappedTypes);
}
