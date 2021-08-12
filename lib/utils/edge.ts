import { Edge, ElementId, FlowElement, ArrowHeadType } from '../types';

export const isEdge = (element: FlowElement): element is Edge =>
  'id' in element && 'source' in element && 'target' in element;

export const getEdgeId = ({ source, target }: Edge): ElementId =>
  `solid-flowy__edge-${source}-${target}}`;

export const getMarkerEnd = (arrowHeadType?: ArrowHeadType | string, markerEndId?: string): string => {
  if (typeof markerEndId !== 'undefined' && markerEndId) {
    return `url(#${markerEndId})`;
  }

  return typeof arrowHeadType !== 'undefined' ? `url(#solid-flowy__${arrowHeadType})` : 'none';
};
