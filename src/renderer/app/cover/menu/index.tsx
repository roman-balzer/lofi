import './style.scss';

import { ipcRenderer } from 'electron';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { IpcMessage, LINUX, MACOS } from '../../../../constants';
import { VisualizationType } from '../../../../models/settings';
import { SpotifyApiInstance } from '../../../api/spotify-api';
import { CloseButton } from '../../../components/close-button';

interface Props {
  isWelcome?: boolean;
  visualizationType?: VisualizationType;
  onVisualizationChange?: () => void;
  onVisualizationCycle?: (isPrevious: boolean) => void;
}

const Menu: FunctionComponent<Props> = ({
  isWelcome = false,
  visualizationType = VisualizationType.None,
  onVisualizationChange = noop,
  onVisualizationCycle = noop,
}) => {
  const visIcon = useMemo((): string => {
    switch (visualizationType) {
      case VisualizationType.Small:
        // FIXME Never go fullscreen in Linux until https://github.com/dvx/lofi/issues/149 is fixed
        return LINUX ? 'fa-compress-arrows-alt' : 'fa-expand-arrows-alt';

      case VisualizationType.Big:
        return 'fa-compress-arrows-alt';

      case VisualizationType.None:
      default:
        return 'fa-expand';
    }
  }, [visualizationType]);

  const handleCloseClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.CloseApp);
  }, []);

  const handleSettingsClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.ShowSettings);
  }, []);

  const handleAboutClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.ShowAbout);
  }, []);

  return (
    <>
      <ul className="menu top">
        <li>
          <button type="button" onClick={handleSettingsClick} className="no-move unstyled-button settings">
            <i className="no-move fa fa-cog" />
          </button>
          <div className="logo-typo">
            <span className="logo-typo" style={{ fontWeight: 'bold' }}>
              lo
            </span>
            fi
          </div>
        </li>
        <li className="pull-right">
          <CloseButton onClose={handleCloseClick} />
        </li>
      </ul>
      {!isWelcome ? (
        <ul className="menu bottom">
          <li>
            {visualizationType !== VisualizationType.None && !MACOS && (
              <button type="button" onClick={() => onVisualizationCycle(true)} className="no-move unstyled-button vis">
                <i className="no-move fa fa-caret-left" />
              </button>
            )}
            <button
              type="button"
              onClick={onVisualizationChange}
              className={`no-move unstyled-button vis vis-change ${MACOS ? 'disabled' : ''}`}>
              <i className={`no-move fa ${visIcon}`} />
            </button>
            {visualizationType !== VisualizationType.None && !MACOS && (
              <button type="button" onClick={() => onVisualizationCycle(false)} className="no-move unstyled-button vis">
                <i className="no-move fa fa-caret-right" />
              </button>
            )}
          </li>
          {SpotifyApiInstance.error ? (
            <li className="pull-right">
              <div className="no-move warning tooltip">
                <i className="no-move fa fa-exclamation-triangle" />
                <span>{SpotifyApiInstance.error}</span>
              </div>
            </li>
          ) : null}
          <li className="pull-right">
            <button type="button" onClick={handleAboutClick} className="no-move unstyled-button help">
              <i className="no-move fa-solid fa-circle-question" />
            </button>
          </li>
        </ul>
      ) : null}
    </>
  );
};

export default Menu;
