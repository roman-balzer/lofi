import './style.scss';

import { ipcRenderer } from 'electron';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { IpcMessage } from '../../../../constants';
import { SideChangedData } from '../../../../models/ipc-messages.models';

interface TrackInfoProps {
  track?: string;
  artist?: string;
}

// TODO fix constant rerendering
export const TrackInfo: FunctionComponent<TrackInfoProps> = ({ track, artist }) => {
  const [isLeft, setIsLeft] = useState(true);

  useEffect(() => {
    ipcRenderer.on(IpcMessage.WindowReady, (_, { isOnLeft }: SideChangedData) => {
      setIsLeft(isOnLeft);
    });

    ipcRenderer.on(IpcMessage.SideChanged, (_, { isOnLeft }: SideChangedData) => {
      setIsLeft(isOnLeft);
    });

    ipcRenderer.on(IpcMessage.SideChanged, (_, { isOnLeft }: SideChangedData) => {
      setIsLeft(isOnLeft);
    });
  }, []);

  return (
    <div className={`track-info ${isLeft ? 'track-info-left' : 'track-info-right'}`}>
      <div className="track">{track}</div>
      <div className="artist">{artist}</div>
    </div>
  );
};
