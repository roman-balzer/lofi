import './style.scss';

import { clamp } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { Settings, VisualizationType } from '../../../models/settings';
import { SpotifyApiInstance } from '../../api/spotify-api';
import { WindowPortal } from '../../components/window-portal';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
import {
  CurrentlyPlayingActions,
  CurrentlyPlayingType,
  SpotifyCurrentlyPlaying,
} from '../../reducers/currently-playing.reducer';
import { Bars } from '../bars';
import { Controls } from './controls';
import Menu from './menu';
import { TrackInfo } from './track-info';
import { Visualizer } from './visualizer';
import { Waiting } from './waiting';

interface Props {
  settings: Settings;
  onVisualizationChange: () => void;
  onVisualizationCycle?: (isPrevious: boolean) => void;
}

export const Cover: FunctionComponent<Props> = ({ settings, onVisualizationChange, onVisualizationCycle }) => {
  const { state, dispatch } = useCurrentlyPlaying();
  const {
    barThickness,
    barColor,
    isAlwaysShowSongProgress,
    isAlwaysShowTrackInfo,
    isDisplayVolumeChange,
    size,
    volumeIncrement,
    visualizationId,
    visualizationType,
    visualizerOpacity,
  } = useMemo(() => settings, [settings]);

  const [currentVolume, setCurrentVolume] = useState<number>();
  const [shouldShowTrackInfo, setShouldShowTrackInfo] = useState(isAlwaysShowTrackInfo);

  useEffect(() => {
    setShouldShowTrackInfo(isAlwaysShowTrackInfo);
  }, [isAlwaysShowTrackInfo]);

  const listeningTo = useCallback(async (): Promise<void> => {
    const currentlyPlaying: SpotifyCurrentlyPlaying = await SpotifyApiInstance.fetch('/me/player?type=episode,track', {
      method: 'GET',
    });

    if (!currentlyPlaying) {
      return;
    }

    dispatch({ type: CurrentlyPlayingActions.SetCurrentlyPlaying, payload: currentlyPlaying });

    // TODO fix
    // if (state.bigVisualization) {
    //   state.visWindow.webContents.send('currently-playing', currentlyPlaying);
    // }
  }, [dispatch]);

  const refreshTrackLiked = useCallback(async (): Promise<void> => {
    if (!state.isPlaying) {
      return;
    }

    if (state.type === CurrentlyPlayingType.Track) {
      const likedResponse: Array<boolean> = await SpotifyApiInstance.fetch(`/me/tracks/contains?ids=${state.id}`, {
        method: 'GET',
      });

      if (!likedResponse || likedResponse.length === 0) {
        return;
      }

      dispatch({ type: CurrentlyPlayingActions.SetTrackLiked, payload: likedResponse[0] });
      await listeningTo();
    }
  }, [dispatch, listeningTo, state.id, state.isPlaying, state.type]);

  const keepAlive = useCallback(async (): Promise<void> => {
    if (state.isPlaying) {
      return;
    }

    await SpotifyApiInstance.fetch(`/me/player/seek?position_ms=${state.progress}`, {
      method: 'PUT',
    });
  }, [state.isPlaying, state.progress]);

  useEffect(() => {
    if (currentVolume && currentVolume !== state.volume) {
      (async () => {
        await SpotifyApiInstance.fetch(`/me/player/volume?volume_percent=${currentVolume}`, {
          method: 'PUT',
        });
        await listeningTo();
      })();
    }
  }, [currentVolume, listeningTo, state.volume]);

  const onMouseWheel = useCallback(
    async ({ deltaY }: WheelEvent): Promise<void> => {
      const direction = Math.sign(deltaY);
      const volume = currentVolume || state.volume;
      const newVolume = clamp(volume - direction * volumeIncrement, 0, 100);
      try {
        if (newVolume === state.volume) {
          return;
        }
        setCurrentVolume(newVolume);
      } catch (error) {
        throw new Error(`Update volume error: ${error}`);
      }
    },
    [currentVolume, state.volume, volumeIncrement]
  );

  useEffect(() => {
    document.getElementById('visible-ui').addEventListener('mousewheel', onMouseWheel);
    return () => {
      document.getElementById('visible-ui').removeEventListener('mousewheel', onMouseWheel);
    };
  }, [onMouseWheel]);

  useEffect(() => {
    let listeningToIntervalId: NodeJS.Timeout;
    (async () => {
      listeningToIntervalId = setInterval(listeningTo, 1000);
    })();

    return () => {
      if (listeningToIntervalId) {
        clearInterval(listeningToIntervalId);
      }
    };
  }, [listeningTo]);

  useEffect(() => {
    let refreshTrackLikedIntervalId: NodeJS.Timeout;

    (async () => {
      refreshTrackLikedIntervalId = setInterval(refreshTrackLiked, 2000);
    })();

    return () => {
      if (refreshTrackLikedIntervalId) {
        clearInterval(refreshTrackLikedIntervalId);
      }
    };
  }, [refreshTrackLiked]);

  useEffect(() => {
    let keepAliveIntervalId: NodeJS.Timeout;
    (async () => {
      keepAliveIntervalId = setInterval(keepAlive, 5000);
    })();

    return () => {
      if (keepAliveIntervalId) {
        clearInterval(keepAliveIntervalId);
      }
    };
  }, [keepAlive]);

  // TODO fix
  //   if (state.visWindow) {
  //     state.visWindow.webContents.send('set-visualization', props.visualizationId);
  //   }
  // }

  const coverUrl = useMemo(() => state.cover, [state.cover]);

  // TODO fix constant rerendering
  return (
    <div
      className="transparent"
      onMouseEnter={() => !isAlwaysShowTrackInfo && setShouldShowTrackInfo(true)}
      onMouseLeave={() => !isAlwaysShowTrackInfo && setShouldShowTrackInfo(false)}>
      <Menu
        onVisualizationChange={onVisualizationChange}
        onVisualizationCycle={onVisualizationCycle}
        visualizationType={visualizationType}
      />

      {state.id && shouldShowTrackInfo && (
        <WindowPortal name="track-info">
          <TrackInfo track={state.track} artist={state.artist} />
        </WindowPortal>
      )}

      <div
        className={`cover full ${state.isPlaying ? '' : 'pause'}`}
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
      />

      {visualizationType === VisualizationType.Small && (
        <Visualizer
          key={visualizationId}
          visualizationId={visualizationId}
          visualizerOpacity={visualizerOpacity}
          size={size}
        />
      )}

      {state.id ? (
        <>
          <Bars
            displayVolumeChange={isDisplayVolumeChange}
            barThickness={barThickness}
            barColor={barColor}
            alwaysShowProgress={isAlwaysShowSongProgress}
          />
          <Controls onTrackLiked={refreshTrackLiked} onPlaybackChanged={listeningTo} />
        </>
      ) : (
        <Waiting />
      )}
    </div>
  );
};
