import './style.scss';

import React, { FunctionComponent, useMemo } from 'react';

import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';

interface Props {
  displayVolumeChange: boolean;
  barThickness: number;
  barColor: string;
  alwaysShowProgress: boolean;
}

export const Bars: FunctionComponent<Props> = ({ displayVolumeChange, barColor, barThickness, alwaysShowProgress }) => {
  const { state } = useCurrentlyPlaying();

  const progressPercentage = useMemo(() => (state.progress / state.duration) * 100, [state.progress, state.duration]);

  return (
    <>
      <div
        className="horizontal bar"
        style={{
          width: `${progressPercentage}%`,
          height: `${barThickness}px`,
          backgroundColor: barColor,
          opacity: alwaysShowProgress && 0.25,
        }}
      />
      <div
        className="vertical bar"
        style={{
          height: `${state.volume}%`,
          width: `${barThickness}px`,
          bottom: `${barThickness}px`,
          backgroundColor: barColor,
        }}>
        {displayVolumeChange && <div className="volume-number">{state.volume}</div>}
      </div>
    </>
  );
};
