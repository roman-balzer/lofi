import { platform } from 'os';

export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const WINDOWS = platform() === 'win32';
export const LINUX = platform() === 'linux';
export const MACOS = platform() === 'darwin';

export const MIN_SIDE_LENGTH = 150;
export const MAX_SIDE_LENGTH = 640;
export const MAX_BAR_THICKNESS = 20;
export const TRACK_INFO_GAP = { X: 10, Y: 10 };

export enum WindowLabel {
  About = 'About Lofi',
  Settings = 'Lofi Settings',
  TrackInfo = 'track-info',
}

export enum WindowName {
  About = 'about',
  Auth = 'auth',
  Settings = 'settings',
  TrackInfo = 'track-info',
}

export enum IpcMessage {
  CloseApp = 'closeApp',
  OpenLink = 'openLink',
  SettingsChanged = 'settingsChanged',
  ShowSettings = 'showSettings',
  ShowAbout = 'showAbout',
  SideChanged = 'sideChanged',
  WindowMoved = 'windowMoved',
  WindowMoving = 'windowMoving',
  WindowReady = 'windowReady',
  WindowResized = 'windowResized',
}

export enum ApplicationUrl {
  Home = 'https://www.lofi.rocks/',
  Discord = 'https://discord.gg/YuH9UJk',
  GitHub = 'https://github.com/dvx/lofi',
}
