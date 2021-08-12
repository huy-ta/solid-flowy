import { JSX, Component, createSignal, For } from 'solid-js';

interface MarkerProps {
  id: string;
}

const Marker: Component<MarkerProps> = (props) => (
  <marker
    className="solid-flowy__arrowhead"
    id={props.id}
    markerWidth="12.5"
    markerHeight="12.5"
    viewBox="-10 -10 20 20"
    orient="auto"
    refX="0"
    refY="0"
  >
    {props.children}
  </marker>
);

export interface MarkerObject {
  id: string;
  element: JSX.Element;
}

type AddMarkerDefinition = (id: string, markerElement: JSX.Element) => void;

let addMarkerDefinitionFn: AddMarkerDefinition;

export const addMarkerDefinition: AddMarkerDefinition = (id, markerElement) => {
  addMarkerDefinitionFn(id, markerElement);
};

const MarkerDefinitions: Component = () => {
  const [markerObjects, setMarkerObjects] = createSignal<MarkerObject[]>([
    {
      id: 'solid-flowy__arrowclosed',
      element: (
        <polyline
          className="solid-flowy__arrowclosed"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      ),
    },
    {
      id: 'solid-flowy__arrow',
      element: (
        <polyline
          className="solid-flowy__arrow"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          points="-5,-4 0,0 -5,4"
        />
      ),
    },
    {
      id: 'solid-flowy__arrowclosed--error',
      element: (
        <polyline
          className="solid-flowy__arrowclosed--error"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      ),
    },
  ]);

  addMarkerDefinitionFn = (id: string, markerElement: JSX.Element) => {
    setMarkerObjects((markerObjects) => [
      ...markerObjects,
      {
        id,
        element: markerElement,
      },
    ]);
  };

  return (
    <defs>
      <For each={markerObjects()}>
        {(markerObject) => <Marker id={markerObject.id}>{markerObject.element}</Marker>}
      </For>
    </defs>
  );
};

export default MarkerDefinitions;
