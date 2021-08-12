import { Component, createMemo, mergeProps, JSX } from 'solid-js';
import cc from 'classcat';

import { BackgroundVariant } from '../../../types';
import { createGridLinesPath, createGridDotsPath } from './utils';
import { useStoreById } from '../../../store/state';

export interface BackgroundProps extends JSX.HTMLAttributes<SVGElement> {
  variant?: BackgroundVariant;
  gap?: number;
  color?: string;
  size?: number;
  storeId: string;
}

const defaultColors = {
  [BackgroundVariant.Dots]: '#81818a',
  [BackgroundVariant.Lines]: '#eee',
};

const Background: Component<BackgroundProps> = (props) => {
  props = mergeProps(
    {
      variant: BackgroundVariant.Dots,
      gap: 15,
      size: 0.4,
    },
    props
  );

  const [state] = useStoreById(props.storeId);
  // when there are multiple flows on a page we need to make sure that every background gets its own pattern.
  const patternId = createMemo(() => `pattern-${Math.floor(Math.random() * 100000)}`);

  const bgClasses = createMemo(() => cc(['solid-flowy__background', props.className]));
  const scaledGap = createMemo(() => props.gap * state.transform[2]);
  const xOffset = createMemo(() => state.transform[0] % scaledGap());
  const yOffset = createMemo(() => state.transform[1] % scaledGap());

  const isLines = createMemo(() => props.variant === BackgroundVariant.Lines);
  const bgColor = createMemo(() => (props.color ? props.color : defaultColors[props.variant]));
  const path = createMemo(() =>
    isLines
      ? createGridLinesPath(scaledGap(), props.size, bgColor())
      : createGridDotsPath(props.size * state.transform[2], bgColor())
  );

  return (
    <svg
      className={bgClasses()}
      style={{
        ...(props.style as JSX.CSSProperties),
        width: '100%',
        height: '100%',
      }}
    >
      <pattern
        id={patternId()}
        x={xOffset()}
        y={yOffset()}
        width={scaledGap()}
        height={scaledGap()}
        patternUnits="userSpaceOnUse"
      >
        {path}
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId()})`} />
    </svg>
  );
};

export default Background;
