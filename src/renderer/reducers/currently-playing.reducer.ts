import { SpotifyUserProfile } from '../api/spotify-api';

/* eslint-disable camelcase */
export enum CurrentlyPlayingType {
  Unknown = 'unknown',
  Track = 'track',
  Ad = 'ad',
  Episode = 'episode',
}

export interface CurrentlyPlaying {
  id: string;
  type: CurrentlyPlayingType;
  track: string;
  artist: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
  cover: string;
  volume: number;
  isLiked: boolean;
  userProfile: SpotifyUserProfile | null;
}

export const INITIAL_STATE: CurrentlyPlaying = {
  id: '',
  type: CurrentlyPlayingType.Unknown,
  track: '',
  artist: '',
  progress: 0,
  duration: 0,
  isPlaying: false,
  cover: '',
  volume: 0,
  isLiked: false,
  userProfile: null,
};

export interface SpotifyCurrentlyPlaying {
  device: {
    volume_percent: number;
  };
  progress_ms: number;
  item: {
    album: {
      name: string;
      images: [
        {
          height: number;
          width: number;
          url: string;
        }
      ];
    };
    artists: [
      {
        name: string;
      }
    ];
    id: string;
    duration_ms: number;
    name: string;
    type: string;
  };
  is_playing: boolean;
}

export enum CurrentlyPlayingActions {
  SetCurrentlyPlaying = 'setCurrentlyPlaying',
  SetTrackLiked = 'setTrackLiked',
  SetUserProfile = 'setUserProfile',
}

export type CurrentlyPlayingAction =
  | {
      type: CurrentlyPlayingActions.SetCurrentlyPlaying;
      payload: SpotifyCurrentlyPlaying;
    }
  | {
      type: CurrentlyPlayingActions.SetTrackLiked;
      payload: boolean;
    }
  | {
      type: CurrentlyPlayingActions.SetUserProfile;
      payload: SpotifyUserProfile;
    };

export const useCurrentlyPlayingReducer = (
  state: CurrentlyPlaying,
  action: CurrentlyPlayingAction
): CurrentlyPlaying => {
  switch (action.type) {
    case CurrentlyPlayingActions.SetCurrentlyPlaying: {
      const {
        item,
        progress_ms,
        is_playing,
        device: { volume_percent },
      } = action.payload;
      const { album, artists, duration_ms, id, name, type } = item;
      if (!item) {
        return state;
      }
      return {
        ...state,
        id,
        type: type as CurrentlyPlayingType,
        track: name,
        artist: artists?.length > 0 ? artists[0].name : '',
        progress: progress_ms,
        duration: duration_ms,
        isPlaying: is_playing,
        cover: album?.images?.length > 0 ? album.images[0].url : '',
        volume: volume_percent,
      };
    }

    case CurrentlyPlayingActions.SetUserProfile: {
      return {
        ...state,
        userProfile: action.payload,
      };
    }

    case CurrentlyPlayingActions.SetTrackLiked: {
      return {
        ...state,
        isLiked: action.payload,
      };
    }

    default: {
      return state;
    }
  }
};
