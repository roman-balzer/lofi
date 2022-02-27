import './style.scss';

import { ipcRenderer, Rectangle } from 'electron';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { IpcMessage, LINUX } from '../../constants';
import { AuthData, refreshAccessToken, setTokenRetrievedCallback } from '../../main/auth';
import { Settings, VisualizationType } from '../../models/settings';
import { visualizations } from '../../visualizations';
import { SpotifyApiInstance } from '../api/spotify-api';
import { WindowPortal } from '../components/window-portal';
import { useCurrentlyPlaying } from '../contexts/currently-playing.context';
import { useSettings } from '../contexts/settings.context';
import { CurrentlyPlayingActions } from '../reducers/currently-playing.reducer';
import { SettingsActionType } from '../reducers/settings.reducer';
import { About } from './about';
import { Cover } from './cover';
import { SettingsWindow } from './settings';
import { Welcome } from './welcome';

const LEFT_MOUSE_BUTTON = 0;

export const App: FunctionComponent = () => {
  const [shouldShowAbout, setShouldShowAbout] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);

  const { state, dispatch } = useSettings();
  const { dispatch: currentlyPlayingDispatch } = useCurrentlyPlaying();
  const { accessToken, refreshToken, visualizationId, visualizationType } = state;

  const updateTokens = useCallback(
    async (data: AuthData) => {
      if (!data || !data.access_token || !data.refresh_token) {
        dispatch({ type: SettingsActionType.ResetTokens });
      } else {
        dispatch({ type: SettingsActionType.SetTokens, payload: data });
      }

      const userProfile = await SpotifyApiInstance.updateTokens(data);

      currentlyPlayingDispatch({
        type: CurrentlyPlayingActions.SetUserProfile,
        payload: userProfile,
      });
    },
    [currentlyPlayingDispatch, dispatch]
  );

  const handleAuth = useCallback(async () => {
    try {
      setTokenRetrievedCallback(updateTokens);

      if (refreshToken) {
        await refreshAccessToken(refreshToken);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      updateTokens({ access_token: null, refresh_token: null });
    }
  }, [refreshToken, updateTokens]);

  useEffect(() => {
    ipcRenderer.on(IpcMessage.ShowSettings, () => setShouldShowSettings(true));

    ipcRenderer.on(IpcMessage.ShowAbout, () => setShouldShowAbout(true));

    ipcRenderer.on(IpcMessage.WindowReady, async () => {
      let animationId = 0;
      let mouseX = 0;
      let mouseY = 0;

      const moveWindow = (): void => {
        ipcRenderer.send(IpcMessage.WindowMoving, { mouseX, mouseY });
        animationId = requestAnimationFrame(moveWindow);
      };

      const onMouseUp = ({ button }: { button: number }): void => {
        if (button !== LEFT_MOUSE_BUTTON) {
          return;
        }

        ipcRenderer.send(IpcMessage.WindowMoved);
        document.removeEventListener('mouseup', onMouseUp);
        cancelAnimationFrame(animationId);
      };

      const onMouseDown = (event: MouseEvent): void => {
        const { button, clientX, clientY, target } = event;
        const targetElement = target as unknown as Element;

        const isNoMoveElement = targetElement.classList?.contains('no-move');
        if (button !== LEFT_MOUSE_BUTTON || isNoMoveElement) {
          return;
        }

        cancelAnimationFrame(animationId);
        mouseX = clientX;
        mouseY = clientY;
        document.addEventListener('mouseup', onMouseUp);

        requestAnimationFrame(moveWindow);
      };

      document.getElementById('app-body').addEventListener('mousedown', onMouseDown);
    });

    ipcRenderer.on(IpcMessage.WindowMoved, (_: Event, newBounds: Rectangle) => {
      dispatch({
        type: SettingsActionType.SetWindowPos,
        payload: { x: newBounds.x, y: newBounds.y },
      });
    });

    ipcRenderer.on(IpcMessage.WindowResized, (_: Event, length: number) => {
      dispatch({
        type: SettingsActionType.SetSize,
        payload: length,
      });
    });
  }, [dispatch]);

  useEffect(() => {
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsSave = useCallback(
    (data?: Settings) => {
      dispatch({
        type: SettingsActionType.UpdateSettings,
        payload: data,
      });
      ipcRenderer.send(IpcMessage.SettingsChanged, data);
    },
    [dispatch]
  );

  const handleVisualizationChange = useCallback(() => {
    switch (visualizationType) {
      case VisualizationType.None: {
        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.Small,
        });
        break;
      }

      case VisualizationType.Small: {
        if (LINUX) {
          // FIXME Never go fullscreen in Linux until https://github.com/dvx/lofi/issues/149 is fixed
          // setVisualization({
          //   visualizationWindow: null,
          //   visualizationType: VISUALIZATION_TYPE.NONE,
          // });
        }

        // TODO
        //   const BrowserWindow = remote.BrowserWindow;
        //   const visWindow = new BrowserWindow({
        //     webPreferences: {
        //       nodeIntegration: true,
        //       enableRemoteModule: true
        //     },
        //   });
        //   visWindow.on('close', () => {
        //     cycleVisualizationType();
        //   });
        //   visWindow.setMenuBarVisibility(false);
        //   visWindow.loadURL(
        //     url.format({
        //       pathname: path.join(__dirname, './visualizer.html'),
        //       protocol: 'file:',
        //       slashes: true,
        //     })
        //   );

        //   // On MacOS, setSimpleFullScreen is buggy/slow
        //   // We need slightly different logic for where the window pops up because Windows is full screen while MacOS isn't
        //   if (MACOS) {
        //     // Just show regular window instead
        //     visWindow.setPosition(
        //       remote.screen.getCursorScreenPoint().x - 400,
        //       remote.screen.getCursorScreenPoint().y
        //     );
        //     visWindow.setSize(800, 600);
        //   } else {
        //     visWindow.setPosition(
        //       remote.getCurrentWindow().getBounds().x,
        //       remote.getCurrentWindow().getBounds().y
        //     );
        //     visWindow.setSimpleFullScreen(true);
        //     if (Boolean(settings.getSync('debug')) === true) {
        //       visWindow.webContents.openDevTools({ mode: 'detach' });
        //     }
        //   }

        //   visWindow.webContents.once('dom-ready', () => {
        //     visWindow.webContents.send(
        //       'set-visualization',
        //       props.lofi.state.lofiSettings.visualizationId
        //     );
        //   });

        //   setState({
        //     visWindow,
        //     visualizationType: VISUALIZATION_TYPE.BIG,
        //   });
        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.Big,
        });
        break;
      }

      case VisualizationType.Big:
      default: {
        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.None,
        });
        break;
      }
    }
  }, [dispatch, visualizationType]);

  const handleVisualizationCycle = useCallback(
    (isPrevious: boolean) => {
      let id: number;
      if (isPrevious) {
        id = visualizationId === 0 ? visualizations.length - 1 : visualizationId - 1;
      } else {
        id = visualizationId === visualizations.length - 1 ? 0 : visualizationId + 1;
      }
      dispatch({
        type: SettingsActionType.SetVisualization,
        payload: id,
      });
    },
    [dispatch, visualizationId]
  );

  return (
    <div id="visible-ui" className="click-on">
      {shouldShowSettings && (
        <WindowPortal onUnload={() => setShouldShowSettings(false)} name="settings">
          <SettingsWindow
            initialValues={state}
            onSave={handleSettingsSave}
            onClose={() => setShouldShowSettings(false)}
            onLogout={() => updateTokens(null)}
          />
        </WindowPortal>
      )}
      {shouldShowAbout && (
        <WindowPortal onUnload={() => setShouldShowAbout(false)} name="about">
          <About onClose={() => setShouldShowAbout(false)} />
        </WindowPortal>
      )}
      {accessToken ? (
        <Cover
          settings={state}
          onVisualizationChange={handleVisualizationChange}
          onVisualizationCycle={handleVisualizationCycle}
        />
      ) : (
        <Welcome />
      )}
    </div>
  );
};
