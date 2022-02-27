import { version } from '../../version.generated';

export enum VisualizationType {
  None,
  Small,
  Big,
}

export interface Settings {
  version: string;
  isDebug: boolean;
  isUsingHardwareAcceleration: boolean;
  accessToken: string;
  refreshToken: string;
  visualizationId: number;
  visualizationType: VisualizationType;
  visualizerOpacity: number;
  isAlwaysOnTop: boolean;
  isVisibleInTaskbar: boolean;
  x: number;
  y: number;
  isAlwaysShowTrackInfo: boolean;
  isAlwaysShowSongProgress: boolean;
  barThickness: number;
  barColor: string;
  size: number;
  volumeIncrement: number;
  isDisplayVolumeChange: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  version,
  x: -1,
  y: -1,
  size: 150,
  isDebug: false,
  isUsingHardwareAcceleration: true,
  accessToken: '',
  refreshToken: '',
  visualizationId: 0,
  visualizationType: VisualizationType.None,
  visualizerOpacity: 100,
  isAlwaysOnTop: true,
  isVisibleInTaskbar: true,
  isAlwaysShowTrackInfo: false,
  isAlwaysShowSongProgress: false,
  isDisplayVolumeChange: false,
  barThickness: 2,
  barColor: '#00FF00',
  volumeIncrement: 5,
};
