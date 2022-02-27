import { SPOTIFY_API_URL as API_URL } from '../../constants';
import { AuthData, refreshAccessToken } from '../../main/auth';

export enum AccountType {
  Unknown = 'unknown',
  Freemium = 'freemium',
  Premium = 'premium',
}

interface SpotifyImage {
  url: string;
}

interface SpotifyAccount {
  id: string;
  product: string;
  email: string;
  display_name: string;
  images: SpotifyImage[];
}

export interface SpotifyUserProfile {
  id: string;
  product: string;
  email: string;
  name: string;
  avatar: string;
}

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

class SpotifyApi {
  private isThrottled: boolean;

  private throttleTime: number;

  private accessToken: string;

  private refreshToken: string;

  private errorMessage: string;

  get error(): string {
    return this.errorMessage;
  }

  async updateTokens(data: AuthData): Promise<SpotifyUserProfile> {
    this.accessToken = data?.access_token;
    this.refreshToken = data?.refresh_token;

    if (!this.accessToken) {
      return null;
    }

    const userProfile = await this.fetch<SpotifyAccount>('/me', {
      method: 'GET',
    });

    return {
      ...userProfile,
      name: userProfile?.display_name,
      avatar: userProfile?.images[0].url,
    };
  }

  async fetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    if (!this.accessToken) {
      return null;
    }

    if (this.isThrottled) {
      const timeLeft = this.throttleTime - new Date().getTime();
      if (timeLeft > 0) {
        this.errorMessage = `API calls throttled, wait ${Math.round(timeLeft / 1000)}s...`;
        return null;
      }
      this.isThrottled = false;
    }

    const initWithBearer = {
      ...init,
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    };

    const res = await fetch(API_URL + input, initWithBearer);
    switch (res.status) {
      case 200: {
        this.errorMessage = null;

        const responseLength = parseInt(res.headers.get('content-length'), 10);
        return responseLength > 0 ? res.json() : null;
      }
      case 204: {
        this.errorMessage = null;

        return null;
      }
      case 401: {
        if (this.refreshToken) {
          await refreshAccessToken(this.refreshToken);
        }
        break;
      }
      case 429: {
        const retryAfter = parseInt(res.headers.get('retry-after'), 10) + 1;
        if (retryAfter) {
          this.throttleTime = new Date().getTime() + retryAfter * 1000;
          this.isThrottled = true;
        }
        break;
      }
      default: {
        break;
      }
    }

    const { error } = await res.json();

    // Normally the api would throw an error but given the limited scope of this api,
    // we'll just output the error to the console and return null.
    this.errorMessage = `${error.status}: ${error.message}`;

    // eslint-disable-next-line no-console
    console.error(this.errorMessage);

    return null;
  }
}

// eslint-disable-next-line import/prefer-default-export
export const SpotifyApiInstance = new SpotifyApi();
