import { Component } from 'solid-js';

import { ElementRendererProps } from '../ElementRenderer';
import ZoomPane from './ZoomPane';

interface ZoomPaneRendererProps
  extends Omit<
    ElementRendererProps,
    | 'elements'
    | 'snapToGrid'
    | 'nodeTypes'
    | 'edgeTypes'
    | 'snapGrid'
    | 'arrowHeadColor'
    | 'onlyRenderVisibleElements'
  > {
}

const ZoomPaneRenderer: Component<ZoomPaneRendererProps> = (props) => {
  const onClick = (event: MouseEvent) => {
      props.onPaneClick?.(event);
    };

  const onContextMenu = 
    (event: MouseEvent) => {
      props.onPaneContextMenu?.(event);
    };

  const onWheel =
    (event: WheelEvent) => {
      props.onPaneScroll?.(event);
    };

  return (
    <ZoomPane
      onMove={props.onMove}
      onMoveStart={props.onMoveStart}
      onMoveEnd={props.onMoveEnd}
      zoomOnScroll={props.zoomOnScroll}
      zoomOnPinch={props.zoomOnPinch}
      panOnScroll={props.panOnScroll}
      panOnScrollSpeed={props.panOnScrollSpeed}
      panOnScrollMode={props.panOnScrollMode}
      zoomOnDoubleClick={props.zoomOnDoubleClick}
      paneMoveable={props.paneMoveable}
      defaultPosition={props.defaultPosition}
      defaultZoom={props.defaultZoom}
      translateExtent={props.translateExtent}
      zoomActivationKeyCode={props.zoomActivationKeyCode}
      storeId={props.storeId}
    >
      {props.children}
      <div className="solid-flowy__pane" onClick={onClick} onContextMenu={onContextMenu} onWheel={onWheel} />
    </ZoomPane>
  );
};

export default ZoomPaneRenderer;
