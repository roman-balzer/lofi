/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import './style.scss';

import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { AccountType, SpotifyApiInstance } from '../../../api/spotify-api';
import { useCurrentlyPlaying } from '../../../contexts/currently-playing.context';

interface Props {
  onPlaybackChanged: () => void;
  onTrackLiked: () => void;
}

export const Controls: FunctionComponent<Props> = ({ onPlaybackChanged, onTrackLiked }) => {
  const { state } = useCurrentlyPlaying();

  const handlePausePlay = useCallback(async (): Promise<void> => {
    if (SpotifyApiInstance.error) {
      return;
    }

    if (state.isPlaying) {
      await SpotifyApiInstance.fetch('/me/player/pause', {
        method: 'PUT',
      });
    } else {
      await SpotifyApiInstance.fetch('/me/player/play', {
        method: 'PUT',
      });
    }

    onPlaybackChanged();
  }, [onPlaybackChanged, state.isPlaying]);

  const handleSkip = useCallback(
    async (direction: string): Promise<void> => {
      if (SpotifyApiInstance.error) {
        return;
      }

      await SpotifyApiInstance.fetch(`/me/player/${direction}`, {
        method: 'POST',
      });

      onPlaybackChanged();
    },
    [onPlaybackChanged]
  );

  const handleLike = useCallback(async (): Promise<void> => {
    if (SpotifyApiInstance.error) {
      return;
    }

    const verb = state.isLiked ? 'DELETE' : 'PUT';
    await SpotifyApiInstance.fetch(`/me/tracks?ids=${state.id}`, {
      method: verb,
    });

    onTrackLiked();
  }, [onTrackLiked, state.id, state.isLiked]);

  const accountType = useMemo(() => state.userProfile?.product as AccountType, [state.userProfile?.product]);

  return (
    <div className="controls-container controls centered" id="controls">
      {accountType ? (
        <div className="controls-cluster">
          {accountType === AccountType.Premium ? (
            <p className="row">
              <a onClick={() => handleSkip('previous')} className="control-btn secondary-control skip">
                <i className="no-move fa fa-step-backward" />
              </a>
              <a onClick={handlePausePlay} className="control-btn pause-play">
                <i className={`no-move fa ${state.isPlaying ? 'fa-pause' : 'fa-play'}`} />
              </a>
              <a type="button" onClick={() => handleSkip('next')} className="control-btn secondary-control skip">
                <i className="no-move fa fa-step-forward" />
              </a>
            </p>
          ) : null}
          <p className="row">
            <a onClick={handleLike} className="love-control-btn tertiary-control">
              <i className={`no-move ${state.isLiked ? 'fa' : 'far'} fa-heart`} />
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
};
