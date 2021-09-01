import { Edge, Node } from '../../../types';
import Handle from '../../../components/Handle';
import { Component, createMemo, mergeProps, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export const ARROW_DISTANCE = 12 + 24;

export const UpArrow = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        className="solid-flowy__standard-handles__arrow__svg-path"
        d="M22.3387 10.1516L12.3381 0.145967C12.2441 0.051967 12.1171 0 11.9842 0C11.8513 0 11.7243 0.0529979 11.6303 0.146951L1.65963 10.1516C1.51667 10.2946 1.47468 10.5095 1.55167 10.6964C1.62964 10.8834 1.8116 11.0044 2.01352 11.0044L7.51166 11.0044L7.51166 23.5002C7.51166 23.7761 7.7356 24 8.01151 24L16.0089 24C16.2848 24 16.5087 23.7761 16.5087 23.5002L16.5087 11.0043L21.9859 11.0043C22.1878 11.0043 22.3697 10.8823 22.4477 10.6954C22.5257 10.5085 22.4817 10.2946 22.3387 10.1516Z"
      />
    </svg>
  );
};

export const RightArrow = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        className="solid-flowy__standard-handles__arrow__svg-path"
        d="M13.8484 22.3389L23.854 12.3383C23.948 12.2443 24 12.1173 24 11.9844C24 11.8515 23.947 11.7245 23.853 11.6305L13.8484 1.65983C13.7054 1.51686 13.4905 1.47488 13.3036 1.55187C13.1166 1.62984 12.9956 1.8118 12.9956 2.01371L12.9956 7.51186L0.499803 7.51186C0.223895 7.51186 -4.52633e-05 7.7358 -4.52754e-05 8.01171L-4.56249e-05 16.0091C-4.5637e-05 16.285 0.223895 16.5089 0.499803 16.5089L12.9957 16.5089L12.9957 21.9861C12.9957 22.188 13.1177 22.3699 13.3046 22.4479C13.4915 22.5259 13.7054 22.4819 13.8484 22.3389Z"
      />
    </svg>
  );
};

export const DownArrow = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="solid-flowy__standard-handles__arrow__svg-path"
        d="M1.66129 13.8484L11.6619 23.854C11.7559 23.948 11.8829 24 12.0158 24C12.1487 24 12.2757 23.947 12.3697 23.853L22.3404 13.8484C22.4833 13.7054 22.5253 13.4905 22.4483 13.3036C22.3704 13.1166 22.1884 12.9956 21.9865 12.9956L16.4883 12.9956L16.4883 0.499803C16.4883 0.223896 16.2644 -4.63203e-05 15.9885 -4.63444e-05L7.99115 -4.70436e-05C7.71524 -4.70677e-05 7.4913 0.223895 7.4913 0.499802L7.4913 12.9957L2.01414 12.9957C1.81222 12.9957 1.63027 13.1177 1.55229 13.3046C1.47432 13.4915 1.51832 13.7054 1.66129 13.8484Z"
      />
    </svg>
  );
};

export const LeftArrow = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="solid-flowy__standard-handles__arrow__svg-path"
        d="M10.1516 1.66109L0.145966 11.6617C0.0519665 11.7557 -4.63492e-07 11.8827 -4.57681e-07 12.0156C-4.5187e-07 12.1485 0.0529975 12.2755 0.14695 12.3695L10.1516 22.3402C10.2946 22.4831 10.5095 22.5251 10.6964 22.4481C10.8834 22.3702 11.0044 22.1882 11.0044 21.9863L11.0044 16.4881L23.5002 16.4881C23.7761 16.4881 24 16.2642 24 15.9883L24 7.99095C24 7.71504 23.7761 7.4911 23.5002 7.4911L11.0043 7.4911L11.0043 2.01395C11.0043 1.81203 10.8823 1.63007 10.6954 1.5521C10.5085 1.47412 10.2946 1.51813 10.1516 1.66109Z"
      />
    </svg>
  );
};

export interface StandardHandlesProps {
  node: Node;
  additionalEdgeProps?: Partial<Edge>;
  shouldShowHandles: boolean;
  topHandleIndicator?: string | Component;
  rightHandleIndicator?: string | Component;
  bottomHandleIndicator?: string | Component;
  leftHandleIndicator?: string | Component;
  storeId: string;
}

const StandardHandles: Component<StandardHandlesProps> = (props) => {
  props = mergeProps(
    {
      additionalEdgeProps: { type: 'standardEdge' },
      topHandleIndicator: 'div',
      rightHandleIndicator: 'div',
      bottomHandleIndicator: 'div',
      leftHandleIndicator: 'div',
    },
    props
  );
  const defaultClassList = createMemo(() => ({
    'solid-flowy__standard-handles__arrow': true,
    'solid-flowy__standard-handles__arrow--hidden': !props.shouldShowHandles,
  }));

  return (
    <Show when={props.shouldShowHandles}>
      <Handle
        node={props.node}
        shouldShowHandle={props.shouldShowHandles}
        additionalEdgeProps={props.additionalEdgeProps}
        storeId={props.storeId}
      >
        <div classList={{ 'solid-flowy__standard-handles__arrow--up': true, ...defaultClassList() }}>
          <Dynamic component={props.topHandleIndicator}>
            <UpArrow />
          </Dynamic>
        </div>
      </Handle>
      <Handle
        node={props.node}
        shouldShowHandle={props.shouldShowHandles}
        additionalEdgeProps={props.additionalEdgeProps}
        storeId={props.storeId}
      >
        <div classList={{ 'solid-flowy__standard-handles__arrow--right': true, ...defaultClassList() }}>
          <Dynamic component={props.rightHandleIndicator}>
            <RightArrow />
          </Dynamic>
        </div>
      </Handle>
      <Handle
        node={props.node}
        shouldShowHandle={props.shouldShowHandles}
        additionalEdgeProps={props.additionalEdgeProps}
        storeId={props.storeId}
      >
        <div classList={{ 'solid-flowy__standard-handles__arrow--down': true, ...defaultClassList() }}>
          <Dynamic component={props.bottomHandleIndicator}>
            <DownArrow />
          </Dynamic>
        </div>
      </Handle>
      <Handle
        node={props.node}
        shouldShowHandle={props.shouldShowHandles}
        additionalEdgeProps={props.additionalEdgeProps}
        storeId={props.storeId}
      >
        <div classList={{ 'solid-flowy__standard-handles__arrow--left': true, ...defaultClassList() }}>
          <Dynamic component={props.leftHandleIndicator}>
            <LeftArrow />
          </Dynamic>
        </div>
      </Handle>
    </Show>
  );
};

export default StandardHandles;
