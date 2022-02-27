import { BrowserWindow, BrowserWindowConstructorOptions, Display, Screen } from 'electron';

import { IpcMessage, TRACK_INFO_GAP, WindowLabel } from '../constants';

export const getCommonWindowOptions = (parent: BrowserWindow): BrowserWindowConstructorOptions => ({
  parent,
  frame: false,
  titleBarOverlay: false,
  titleBarStyle: 'hidden',
  minimizable: false,
  maximizable: false,
  resizable: false,
  alwaysOnTop: true,
  fullscreenable: false,
});

export const getSettingsWindowOptions = (mainWindow: BrowserWindow): BrowserWindowConstructorOptions => {
  const bounds = mainWindow.getBounds();
  const width = 400;
  const height = 570;

  return {
    ...getCommonWindowOptions(mainWindow),
    height,
    width,
    x: bounds.x - width / 2 + bounds.width / 2,
    y: bounds.y - height / 2 + bounds.height / 2,
    title: WindowLabel.Settings,
  };
};

export const getAboutWindowOptions = (mainWindow: BrowserWindow): BrowserWindowConstructorOptions => {
  const bounds = mainWindow.getBounds();
  const width = 400;
  const height = 440;
  return {
    ...getCommonWindowOptions(mainWindow),
    height,
    width,
    x: bounds.x - width / 2 + bounds.width / 2,
    y: bounds.y - height / 2 + bounds.height / 2,
    title: WindowLabel.About,
  };
};

export const getTrackInfoWindowOptions = (
  mainWindow: BrowserWindow,
  isAlwaysOnTop: boolean
): BrowserWindowConstructorOptions => {
  const { x, y, width } = mainWindow.getBounds();
  return {
    ...getCommonWindowOptions(mainWindow),
    frame: false,
    titleBarStyle: 'hidden',
    roundedCorners: false,
    skipTaskbar: true,
    alwaysOnTop: isAlwaysOnTop,
    height: 200,
    width: 400,
    transparent: true,
    x: x + width + TRACK_INFO_GAP.X,
    y: y + TRACK_INFO_GAP.Y,
    title: WindowLabel.TrackInfo,
  };
};

export const showDevTool = (window: BrowserWindow, isShow: boolean): void => {
  if (isShow) {
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.webContents.closeDevTools();
  }
};

export const checkIfAppIsOnLeftSide = (display: Display, x: number, appWidth: number): boolean =>
  display.bounds.x + display.bounds.width / 2 > x + appWidth / 2;

export const setAlwaysOnTop = (window: BrowserWindow, isAlwaysOnTop: boolean): void =>
  window && window.setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');

export const findWindow = (window: BrowserWindow, name: string): BrowserWindow | undefined => {
  const foundWindows = window.getChildWindows().filter((child) => child.title === name);
  return foundWindows.length ? foundWindows[0] : undefined;
};

export const moveTrackInfo = (mainWindow: BrowserWindow, screen: Screen): void => {
  const { x, y, width } = mainWindow.getBounds();
  const trackInfoWindow = findWindow(mainWindow, WindowLabel.TrackInfo);
  if (!trackInfoWindow) {
    return;
  }

  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const isOnLeft = checkIfAppIsOnLeftSide(currentDisplay, x, width);
  mainWindow.webContents.send(IpcMessage.SideChanged, { isOnLeft });

  const originalBounds = trackInfoWindow.getBounds();
  const newBounds = {
    ...originalBounds,
    x: isOnLeft ? x + width + TRACK_INFO_GAP.X : x - originalBounds.width - TRACK_INFO_GAP.X,
    y: y + TRACK_INFO_GAP.Y,
  };

  trackInfoWindow.setBounds(newBounds);
};
