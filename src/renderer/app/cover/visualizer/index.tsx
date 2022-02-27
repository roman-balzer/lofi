import './style.scss';

import React, { FunctionComponent, useEffect, useRef } from 'react';

import { visualizations } from '../../../../visualizations';

// TODO add peak and time factor
interface Props {
  visualizationId: number;
  visualizerOpacity: number;
  peakFactor?: number;
  timeFactor?: number;
  size: number;
}

export const Visualizer: FunctionComponent<Props> = ({
  visualizationId,
  visualizerOpacity,
  peakFactor,
  timeFactor,
  size,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!visualizationId || visualizationId < 0 || visualizationId >= visualizations.length) {
      visualizations[0].visualize({ canvas: canvasRef.current, peakFactor, timeFactor });
    } else {
      visualizations[visualizationId].visualize({ canvas: canvasRef.current, peakFactor, timeFactor });
    }
    const canvasRefValue = canvasRef.current;
    return () => {
      if (canvasRefValue) {
        const gl = canvasRefValue.getContext('webgl');
        gl.getExtension('WEBGL_lose_context').loseContext();
      }
    };
  }, [visualizationId]);

  return (
    <canvas
      ref={canvasRef}
      className="cover full"
      style={{ opacity: visualizerOpacity / 100 }}
      height={size}
      width={size}
      id="small-visualization"
    />
  );
};
