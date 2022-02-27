import '../../build/Release/black-magic.node';
import '../../icon.png';
import '../../icon.ico';

import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  HandlerDetails,
  ipcMain,
  Menu,
  nativeImage,
  Rectangle,
  screen,
  shell,
  Tray,
} from 'electron';
import Store from 'electron-store';
import * as path from 'path';

import { version } from '../../version.generated';
import { ApplicationUrl, IpcMessage, LINUX, MACOS, MAX_SIDE_LENGTH, MIN_SIDE_LENGTH, WindowName } from '../constants';
import { MouseData } from '../models/ipc-messages.models';
import { DEFAULT_SETTINGS, Settings } from '../models/settings';
import {
  checkIfAppIsOnLeftSide,
  getAboutWindowOptions,
  getSettingsWindowOptions,
  getTrackInfoWindowOptions,
  moveTrackInfo,
  showDevTool,
} from './main.utils';

const DEFAULT_SIZE = 150;

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendArgument('disable-gpu-vsync');
app.commandLine.appendSwitch('enable-transparent-visuals');

if (process.env.NODE_ENV === 'development') {
  app.commandLine.appendSwitch('trace-warnings');
  app.commandLine.appendSwitch('enable-logging', '1');
}

Store.initRenderer();
const store = new Store({ clearInvalidConfig: true });
const storeSettings = store.get('settings') as Settings;
const settings = { ...DEFAULT_SETTINGS, ...storeSettings };

const useGpu = settings.isUsingHardwareAcceleration ?? DEFAULT_SETTINGS.isUsingHardwareAcceleration;

// FIXME Patch to always disable hardware acceleration on LINUX, cf. https://github.com/dvx/lofi/issues/149
if (!useGpu || LINUX) {
  app.disableHardwareAcceleration();
}

let mainWindow: BrowserWindow | null = null;
let mousePoller: NodeJS.Timeout;
let initialBounds: Rectangle;

let tray = null;
Menu.setApplicationMenu(null);

const isSingleInstance: boolean = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
}

const createMainWindow = (): void => {
  mainWindow = new BrowserWindow({
    x: settings.x ?? -1,
    y: settings.y ?? -1,
    height: settings.size ?? DEFAULT_SIZE,
    width: settings.size ?? DEFAULT_SIZE,
    minHeight: MIN_SIDE_LENGTH,
    minWidth: MIN_SIDE_LENGTH,
    maxHeight: MAX_SIDE_LENGTH,
    maxWidth: MAX_SIDE_LENGTH,
    movable: false,
    frame: false,
    resizable: true,
    maximizable: false,
    minimizable: true,
    transparent: true,
    hasShadow: false,
    skipTaskbar: !settings.isVisibleInTaskbar,
    focusable: settings.isVisibleInTaskbar,
    title: 'Lofi',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#00000000',
    roundedCorners: false,
  });

  // TODO Test this
  // // Workaround to make setSkipTaskbar behave
  // // cf. https://github.com/electron/electron/issues/18378
  // mainWindow.on('focus', () => {
  //   mainWindow.setSkipTaskbar(!settings.window.show_in_taskbar);
  // });

  mainWindow.setVisibleOnAllWorkspaces(true);

  mainWindow.loadURL(`file://${path.join(__dirname, './index.html')}`);

  showDevTool(mainWindow, settings.isDebug);

  ipcMain.on(IpcMessage.WindowMoving, (_: Event, { mouseX, mouseY }: MouseData) => {
    const { x, y } = screen.getCursorScreenPoint();

    const bounds: Partial<Rectangle> = {
      x: x - mouseX,
      y: y - mouseY,
    };

    // Bounds increase even when set to the same value, this is a quirk of the setBounds function
    // We must keep the bounds constant to keep the window where it should be
    // See: https://github.com/dvx/lofi/issues/118
    if (!initialBounds) {
      initialBounds = mainWindow.getBounds();
    } else {
      bounds.width = initialBounds.width;
      bounds.height = initialBounds.height;
    }

    // Use setBounds instead of setPosition
    // See: https://github.com/electron/electron/issues/9477#issuecomment-406833003
    mainWindow.setBounds(bounds);
    moveTrackInfo(mainWindow, screen);

    mainWindow.webContents.send(IpcMessage.WindowMoved, mainWindow.getBounds());
  });

  ipcMain.on(IpcMessage.WindowMoved, (_: Event) => {
    initialBounds = null;
  });

  mainWindow.on('resize', () => {
    moveTrackInfo(mainWindow, screen);
  });

  mainWindow.on('resized', () => {
    const size = mainWindow.getSize();
    const [width, height] = size;
    const newSize = Math.min(width, height);
    mainWindow.setSize(newSize, newSize, true);
    mainWindow.webContents.send(IpcMessage.WindowResized, newSize);
  });

  const closeWindow = (): void => {
    mainWindow.close();
  };

  ipcMain.on('close', closeWindow);

  ipcMain.on(
    IpcMessage.SettingsChanged,
    (_: Event, { x, y, size, isAlwaysOnTop, isDebug, isVisibleInTaskbar }: Settings) => {
      mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
      mainWindow.setSkipTaskbar(!isVisibleInTaskbar);
      showDevTool(mainWindow, isDebug);

      mainWindow.setBounds({ x, y, height: size, width: size });
      if (x === -1 && y === -1) {
        mainWindow.center();
      }
      moveTrackInfo(mainWindow, screen);
    }
  );

  ipcMain.on(IpcMessage.CloseApp, () => {
    clearTimeout(mousePoller);
    app.quit();
  });

  ipcMain.on(IpcMessage.OpenLink, (_: Event, url: ApplicationUrl) => {
    if (!Object.values(ApplicationUrl).includes(url)) {
      // eslint-disable-next-line no-console
      console.error(`Invalid url ${url}`);
      return;
    }
    shell.openExternal(url);
  });

  ipcMain.on(IpcMessage.ShowAbout, (_: Event) => {
    mainWindow.webContents.send(IpcMessage.ShowAbout);
  });

  ipcMain.on(IpcMessage.ShowSettings, (_: Event) => {
    mainWindow.webContents.send(IpcMessage.ShowSettings);
  });

  const windowOpenHandler = (
    details: HandlerDetails
  ): { action: 'allow' | 'deny'; overrideBrowserWindowOptions?: BrowserWindowConstructorOptions } => {
    switch (details.frameName) {
      case WindowName.Settings: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getSettingsWindowOptions(mainWindow),
        };
      }
      case WindowName.About: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getAboutWindowOptions(mainWindow),
        };
      }
      case WindowName.TrackInfo: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getTrackInfoWindowOptions(mainWindow, settings.isAlwaysOnTop),
        };
      }
      case WindowName.Auth: {
        shell.openExternal(details.url);
        break;
      }
      default: {
        throw new Error(`Invalid frame name: ${details.frameName}`);
      }
    }

    return { action: 'deny' };
  };

  mainWindow.webContents.on('did-create-window', (childWindow, { frameName }) => {
    switch (frameName) {
      case WindowName.TrackInfo: {
        moveTrackInfo(mainWindow, screen);
        break;
      }

      case WindowName.Settings: {
        childWindow.webContents.setWindowOpenHandler(windowOpenHandler);
        break;
      }

      default: {
        break;
      }
    }

    showDevTool(childWindow, settings.isDebug);
  });

  mainWindow.webContents.setWindowOpenHandler(windowOpenHandler);
};

app.on('ready', () => {
  if (settings?.version === null || settings.version !== String(version)) {
    store.reset();
  }

  if (LINUX) {
    // Linux transparency fix, delay launch by 1s
    setTimeout(createMainWindow, 1000);
  } else {
    createMainWindow();
  }

  const iconPath = `${__dirname}/icon.png`;
  const icon = nativeImage.createFromPath(iconPath).resize({ height: 16 });
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `lofi v${version}`,
      enabled: false,
      icon,
    },
    { type: 'separator' },
    {
      label: 'Settings',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send(IpcMessage.ShowSettings);
      },
    },
    {
      label: 'About',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send(IpcMessage.ShowAbout);
      },
    },
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(`lofi v${version}`);

  mainWindow.once('ready-to-show', () => {
    if (settings.x === -1 && settings.y === -1) {
      mainWindow.center();
    }

    mainWindow.setAlwaysOnTop(settings.isAlwaysOnTop, 'screen-saver');

    const bounds = mainWindow.getBounds();
    const currentDisplay = screen.getDisplayMatching(bounds);
    const isOnLeft = checkIfAppIsOnLeftSide(currentDisplay, bounds.x, bounds.width);
    mainWindow.webContents.send(IpcMessage.WindowReady, { isOnLeft });
    moveTrackInfo(mainWindow, screen);
  });
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createMainWindow();
  }
});
