import { Selection } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';
import { v4 as uuidv4 } from 'uuid';
import { createStore, produce, Store } from 'solid-js/store';

import {
  Node,
  Edge,
  NodeExtent,
  SnapGrid,
  Transform,
  TranslateExtent,
  Dimensions,
  Point,
  ElementId,
  Elements,
} from '../types';
import { clampPosition, getDimensions } from '../utils';
import { isNode } from '../utils/node';
import { parseEdge, parseNode } from '../utils/parse';
import { isEdge } from '../utils/edge';

export type NodeValidator = (
  sourceNode: Node,
  targetNode: Node,
  connectingEdge: Edge
) => { isValid: boolean; reason?: string };

export interface SolidFlowyState {
  width: number;
  height: number;
  transform: Transform;
  nodes: Record<string, Node>;
  edges: Record<string, Edge>;

  d3Zoom: ZoomBehavior<Element, unknown> | null;
  d3Selection: Selection<Element, unknown, null, undefined> | null;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  minZoom: number;
  maxZoom: number;
  translateExtent: TranslateExtent;
  nodeExtent: NodeExtent;

  snapToGrid: boolean;
  snapGrid: SnapGrid;

  nodesDraggable: boolean;
  nodesConnectable: boolean;

  nodeValidators: Record<string, NodeValidator>;
}

type NextElements = {
  nextNodes: Node[];
  nextEdges: Edge[];
};

export type NodePosUpdate = {
  id: ElementId;
  pos: Point;
};

export type NodeDiffUpdate = {
  id?: ElementId;
  diff?: Point;
  isDragging?: boolean;
};

export type NodeDimensionUpdate = {
  id: ElementId;
  nodeElement: HTMLDivElement;
  forceUpdate?: boolean;
};

export type InitD3ZoomPayload = {
  d3Zoom: ZoomBehavior<Element, unknown>;
  d3Selection: Selection<Element, unknown, null, undefined>;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  transform: Transform;
};

export interface SolidFlowyActions {
  setElements: (propElements: Elements) => void;
  upsertNode: (node: Node) => void;
  upsertEdge: (edge: Edge) => void;
  unselectAllElements: () => void;
  setSelectedElementById: (id: string) => void;
  deleteElementById: (id: string) => void;
  updateNodeDimensions: (updates: NodeDimensionUpdate[]) => void;
  updateNodePos: (update: NodePosUpdate) => void;
  updateNodePosDiff: (update: NodeDiffUpdate) => void;
  setNodeExtent: (nodeExtent: NodeExtent) => void;
  updateTransform: (transform: Transform) => void;
  updateSize: (size: Dimensions) => void;
  initD3Zoom: (payload: InitD3ZoomPayload) => void;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (translateExtent: TranslateExtent) => void;
  translateTo: ([x, y]: [number, number]) => void;
  zoomTo: (zoom: number) => void;
  setSnapToGrid: (snapToGrid: boolean) => void;
  setSnapGrid: (snapGrid: SnapGrid) => void;
  setInteractive: (isInteractive: boolean) => void;
  setNodesDraggable: (nodesDraggable: boolean) => void;
  setNodesConnectable: (nodesConnectable: boolean) => void;
  registerNodeValidator: (nodeType: string) => (validator: NodeValidator) => void;
}

export type SolidFlowyStore = [Store<SolidFlowyState>, SolidFlowyActions];

const storeMapping: Record<string, SolidFlowyStore> = {};

export const initializeStore = (storeId?: string) => {
  if (storeMapping[storeId]) return storeId;

  const initialState: SolidFlowyState = {
    width: 0,
    height: 0,
    transform: [0, 0, 1],
    nodes: {},
    edges: {},

    d3Zoom: null,
    d3Selection: null,
    d3ZoomHandler: undefined,
    minZoom: 0.05,
    maxZoom: 2,
    translateExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],

    nodeExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],

    snapGrid: [15, 15],
    snapToGrid: false,

    nodesDraggable: true,
    nodesConnectable: true,

    nodeValidators: {},
  };

  const [state, setState] = createStore(initialState);

  const store: SolidFlowyStore = [
    state,
    {
      setElements: (propElements: Elements) => {
        [...Object.values(state.nodes), ...Object.values(state.edges)].forEach((element) => {
          const foundPropElement = propElements.find(({ id }) => id === element.id);

          if (foundPropElement) return;

          setState(
            produce<SolidFlowyState>((s) => {
              if (isNode(element)) {
                delete s.nodes[element.id];
              } else if (isEdge(element)) {
                delete s.edges[element.id];
              }
            })
          );
        });

        propElements.forEach((propElement) => {
          if (isNode(propElement)) {
            if (!state.nodes[propElement.id]) {
              setState('nodes', propElement.id, parseNode(propElement, state.nodeExtent));

              return;
            }

            const updatedNode = { ...propElement };

            if (typeof propElement.type !== 'undefined' && propElement.type !== state.nodes[propElement.id].type) {
              // we reset the elements dimensions here in order to force a re-calculation of the bounds.
              // When the type of a node changes it is possible that the number or positions of handles changes too.
              delete updatedNode.width;
            }

            setState('nodes', propElement.id, updatedNode);

            return;
          }

          if (isEdge(propElement)) {
            if (!state.edges[propElement.id]) {
              setState('edges', propElement.id, parseEdge(propElement));

              return;
            }

            setState('nodes', propElement.id, { ...propElement });
          }
        });
      },

      upsertNode: (node: Node) => {
        setState('nodes', node.id, node);
      },

      upsertEdge: (edge: Edge) => {
        setState('edges', edge.id, edge);
      },

      unselectAllElements: () => {
        for (const nodeId in state.nodes) {
          if (state.nodes[nodeId].isSelected) {
            setState('nodes', nodeId, 'isSelected', false);
          }
        }

        for (const edgeId in state.edges) {
          if (state.edges[edgeId].isSelected) {
            setState('edges', edgeId, 'isSelected', false);
          }
        }
      },

      setSelectedElementById: (id: string) => {
        store[1].unselectAllElements();

        if (state.nodes[id]) {
          setState('nodes', id, 'isSelected', true);

          return;
        }

        if (state.edges[id]) {
          setState('edges', id, 'isSelected', true);

          return;
        }
      },

      deleteElementById: (id: string) => {
        setState(
          produce<SolidFlowyState>((s) => {
            if (s.nodes[id]) {
              delete s.nodes[id];

              for (const edgeId in s.edges) {
                if (s.edges[edgeId].source !== id && s.edges[edgeId].target !== id) return;

                delete s.edges[edgeId];
              }

              return;
            }

            if (s.edges[id]) {
              delete s.edges[id];

              return;
            }
          })
        );
      },

      updateNodeDimensions: (updates: NodeDimensionUpdate[]) => {
        setState(
          produce<SolidFlowyState>((s) => {
            updates.forEach((update) => {
              const dimensions = getDimensions(update.nodeElement);
              const doUpdate =
                dimensions.width &&
                dimensions.height &&
                (s.nodes[update.id].width !== dimensions.width ||
                  s.nodes[update.id].height !== dimensions.height ||
                  update.forceUpdate);

              if (doUpdate) {
                for (const dimension in dimensions) {
                  s.nodes[update.id][dimension] = dimensions[dimension];
                }
              }
            });
          })
        );
      },

      updateNodePos: ({ id, pos }: NodePosUpdate) => {
        let position: Point = pos;

        if (state.snapToGrid) {
          const [gridSizeX, gridSizeY] = state.snapGrid;

          position = {
            x: gridSizeX * Math.round(pos.x / gridSizeX),
            y: gridSizeY * Math.round(pos.y / gridSizeY),
          };
        }

        setState('nodes', id, 'position', position);
      },

      updateNodePosDiff: ({ id, diff, isDragging }: NodeDiffUpdate) => {
        setState(
          produce<SolidFlowyState>((s) => {
            s.nodes[id].isDragging = isDragging;

            if (diff) {
              s.nodes[id].position = {
                x: s.nodes[id].position.x + diff.x,
                y: s.nodes[id].position.y + diff.y,
              };
            }
          })
        );
      },

      setNodeExtent: (nodeExtent: NodeExtent) => {
        setState(
          produce<SolidFlowyState>((s) => {
            s.nodeExtent = nodeExtent;

            for (const nodeId in s.nodes) {
              s.nodes[nodeId].position = clampPosition(s.nodes[nodeId].position, nodeExtent);
            }
          })
        );
      },

      updateTransform: (transform: Transform) => setState('transform', transform),

      updateSize: (size: Dimensions) => {
        setState(
          produce<SolidFlowyState>((s) => {
            s.width = size.width || 500;
            s.height = size.height || 500;
          })
        );
      },

      initD3Zoom: ({ d3Zoom, d3Selection, d3ZoomHandler, transform }: InitD3ZoomPayload) =>
        setState(
          produce<SolidFlowyState>((s) => {
            s.d3Zoom = d3Zoom;
            s.d3Selection = d3Selection;
            s.d3ZoomHandler = d3ZoomHandler;
            s.transform = transform;
          })
        ),

      setMinZoom: (minZoom: number) => {
        setState('minZoom', minZoom);

        state.d3Zoom?.scaleExtent([minZoom, state.maxZoom]);
      },

      setMaxZoom: (maxZoom: number) => {
        setState('maxZoom', maxZoom);

        state.d3Zoom?.scaleExtent([state.minZoom, maxZoom]);
      },

      setTranslateExtent: (translateExtent: TranslateExtent) => {
        setState('translateExtent', translateExtent);

        state.d3Zoom?.translateExtent(translateExtent);
      },

      translateTo: ([x, y]: [number, number]) => {
        state.d3Zoom?.translateTo(state.d3Selection!, x, y);
      },

      zoomTo: (zoom: number) => {
        state.d3Zoom?.scaleTo(state.d3Selection!, zoom);
      },

      setSnapToGrid: (snapToGrid: boolean) => setState('snapToGrid', snapToGrid),

      setSnapGrid: (snapGrid: SnapGrid) => setState('snapGrid', snapGrid),

      setInteractive: (isInteractive: boolean) => {
        setState(
          produce<SolidFlowyState>((s) => {
            s.nodesDraggable = isInteractive;
            s.nodesConnectable = isInteractive;
          })
        );
      },

      setNodesDraggable: (nodesDraggable: boolean) => setState('nodesDraggable', nodesDraggable),

      setNodesConnectable: (nodesConnectable: boolean) => setState('nodesConnectable', nodesConnectable),

      registerNodeValidator: (nodeType: string) => (validator: NodeValidator) => {
        setState(
          produce<SolidFlowyState>((s) => {
            s.nodeValidators[nodeType] = validator;
          })
        );
      },
    },
  ];

  const newStoreId = uuidv4();

  storeMapping[newStoreId] = store;

  return newStoreId;
};

export const useStoreById = (storeId: string) => {
  return storeMapping[storeId];
};
