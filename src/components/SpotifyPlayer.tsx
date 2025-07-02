'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

interface SpotifyPlayerProps {
  token: string;
  onPlayerReady?: (deviceId: string) => void;
  onStateChange?: (state: Spotify.PlaybackState) => void;
}

export function SpotifyPlayer({ token, onPlayerReady, onStateChange }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  const initializePlayer = useCallback(() => {
    const player = new window.Spotify.Player({
      name: 'Back2Back DJ Player',
      getOAuthToken: (cb: (token: string) => void) => {
        console.log('Spotify requesting OAuth token');
        cb(token);
      },
      volume: 0.5,
    });

    // Error handling with retry logic
    player.addListener('initialization_error', ({ message }) => {
      console.error('Failed to initialize player:', message);
      // Try to reconnect after delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        player.connect();
      }, 5000);
    });

    player.addListener('authentication_error', ({ message }) => {
      console.error('Failed to authenticate player:', message);
      console.log('Will retry authentication in 10 seconds...');
      setTimeout(() => {
        player.connect();
      }, 10000);
    });

    player.addListener('account_error', ({ message }) => {
      console.error('Failed to validate Spotify account:', message);
      console.log('Please check your Spotify Premium subscription');
    });

    player.addListener('playback_error', ({ message }) => {
      console.error('Failed to perform playback:', message);
    });

    // Playback status updates
    player.addListener('player_state_changed', (state) => {
      console.log('Player state changed:', state);
      if (state && onStateChange) {
        onStateChange(state);
      }
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('✅ Player is ready with Device ID:', device_id);
      setDeviceId(device_id);
      setIsReady(true);
      if (onPlayerReady) {
        onPlayerReady(device_id);
      }
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('❌ Device ID has gone offline:', device_id);
      setIsReady(false);
    });

    // Connect to the player with retry logic
    const connectWithRetry = (retries = 3) => {
      player.connect().then(success => {
        if (success) {
          console.log('✅ Successfully connected to Spotify!');
        } else {
          console.error('❌ Failed to connect to Spotify');
          if (retries > 0) {
            console.log(`🔄 Retrying connection... (${retries} attempts left)`);
            setTimeout(() => connectWithRetry(retries - 1), 3000);
          }
        }
      });
    };

    connectWithRetry();
    setPlayer(player);
  }, [token, onPlayerReady, onStateChange]);

  useEffect(() => {
    if (window.Spotify && token) {
      initializePlayer();
    }
  }, [token, initializePlayer]);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (token) {
        initializePlayer();
      }
    };
  }, [token, initializePlayer]);

  const play = async (uri?: string) => {
    if (!player || !deviceId) {
      console.error('Player or device not ready:', { player: !!player, deviceId });
      return;
    }

    try {
      // First, make sure this device is active
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Wait a bit for device to activate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now play the track
      const body = uri ? JSON.stringify({ uris: [uri] }) : undefined;
      console.log('Playing track:', { uri, deviceId, body });

      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify API error:', response.status, errorText);
        throw new Error(`Failed to play: ${response.status} ${errorText}`);
      }

      console.log('Track started successfully');
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const pause = async () => {
    if (!player) return;
    await player.pause();
  };

  const resume = async () => {
    if (!player) return;
    await player.resume();
  };

  const seek = async (position: number) => {
    if (!player) return;
    await player.seek(position);
  };

  return (
    <>
      <Script src="https://sdk.scdn.co/spotify-player.js" />
      <div style={{ display: 'none' }}>
        {isReady ? 'Spotify Player Ready' : 'Initializing Spotify Player...'}
      </div>
    </>
  );
}

export function useSpotifyPlayer(token: string) {
  const [deviceId, setDeviceId] = useState<string>('');
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState | null>(null);

  const handlePlayerReady = (deviceId: string) => {
    setDeviceId(deviceId);
  };

  const handleStateChange = (state: Spotify.PlaybackState) => {
    setPlaybackState(state);
  };

  return {
    deviceId,
    playbackState,
    SpotifyPlayerComponent: (
      <SpotifyPlayer
        token={token}
        onPlayerReady={handlePlayerReady}
        onStateChange={handleStateChange}
      />
    ),
  };
}