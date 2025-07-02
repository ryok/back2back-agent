'use client';

import { useState, useEffect } from 'react';
import { DJDeck } from '../components/DJDeck';
import { Mixer } from '../components/Mixer';
import { TrackLibrary } from '../components/TrackLibrary';
import { SessionInfo } from '../components/SessionInfo';
import { SpotifyPlayer, useSpotifyPlayer } from '../components/SpotifyPlayer';
import { SpotifyAuth } from '../components/SpotifyAuth';
import { SpotifySearch } from '../components/SpotifySearch';
import { SpotifyDebug } from '../components/SpotifyDebug';
import { TrackDebug } from '../components/TrackDebug';
import { AppInfo } from '../components/AppInfo';
import type { Track, DJSession } from '../types/dj';

export default function Home() {
  const [session, setSession] = useState<DJSession | null>(null);
  const [humanTrack, setHumanTrack] = useState<Track | null>(null);
  const [aiTrack, setAiTrack] = useState<Track | null>(null);
  const [crossfaderPosition, setCrossfaderPosition] = useState(50);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Check for Spotify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/spotify/token');
        if (response.ok) {
          const data = await response.json();
          setSpotifyToken(data.token);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      }
    };
    checkAuth();
  }, []);

  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Midnight City',
      artist: 'M83',
      bpm: 128,
      key: '8A',
      duration: 240,
      genre: 'Electronic',
      energy: 8,
    },
    {
      id: '2',
      title: 'One More Time',
      artist: 'Daft Punk',
      bpm: 123,
      key: '9B',
      duration: 320,
      genre: 'House',
      energy: 9,
    },
    {
      id: '3',
      title: 'Strobe',
      artist: 'Deadmau5',
      bpm: 128,
      key: '7A',
      duration: 600,
      genre: 'Progressive House',
      energy: 7,
    },
    {
      id: '4',
      title: 'Animals',
      artist: 'Martin Garrix',
      bpm: 128,
      key: '5A',
      duration: 302,
      genre: 'Big Room House',
      energy: 10,
    },
    {
      id: '5',
      title: 'Clarity',
      artist: 'Zedd',
      bpm: 128,
      key: '11B',
      duration: 271,
      genre: 'Progressive House',
      energy: 8,
    },
  ];

  const startSession = async () => {
    try {
      const response = await fetch('/api/dj-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanDJ: 'Human DJ',
          initialTrack: mockTracks[0],
        }),
      });
      
      const data = await response.json();
      setSession(data.session);
      setHumanTrack(mockTracks[0]);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const loadTrack = (track: Track, deck: 'human' | 'ai') => {
    if (deck === 'human') {
      setHumanTrack(track);
    } else {
      setAiTrack(track);
    }
  };

  const requestAITrack = async () => {
    if (!humanTrack) {
      alert('Please load a track on the Human DJ deck first!');
      return;
    }
    
    try {
      // If we have Spotify token, search for related tracks
      if (spotifyToken) {
        // Search for tracks similar to current track
        const searchQuery = `genre:"${humanTrack.genre || 'electronic'}" NOT artist:"${humanTrack.artist}"`;
        console.log('AI searching for:', searchQuery);
        const searchResponse = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
        const searchData = await searchResponse.json();
        
        if (searchData.tracks && searchData.tracks.length > 0) {
          // Filter out the current track and get audio features
          const availableTracks = searchData.tracks.filter((t: Track) => t.id !== humanTrack.id);
          
          if (availableTracks.length > 0) {
            // Get audio features for better matching
            const tracksWithFeatures = await Promise.all(
              availableTracks.slice(0, 5).map(async (track: Track) => {
                try {
                  const featuresResponse = await fetch(`/api/spotify/track/${track.spotifyId}/audio-features`);
                  if (featuresResponse.ok) {
                    const features = await featuresResponse.json();
                    return {
                      ...track,
                      bpm: features.bpm,
                      key: features.key,
                      energy: features.energy,
                    };
                  }
                } catch (error) {
                  console.error('Failed to get audio features:', error);
                }
                return track;
              })
            );
            
            // Simple AI logic: find track with similar BPM
            const sortedTracks = tracksWithFeatures.sort((a, b) => {
              const aDiff = Math.abs(a.bpm - humanTrack.bpm);
              const bDiff = Math.abs(b.bpm - humanTrack.bpm);
              return aDiff - bDiff;
            });
            
            const selectedTrack = sortedTracks[0];
            setAiTrack(selectedTrack);
            console.log('AI selected:', selectedTrack.title, 'by', selectedTrack.artist);
            return;
          }
        }
      }
      
      // Fallback to API endpoint with mock tracks
      const response = await fetch('/api/dj-session/next-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id,
          currentTrack: humanTrack,
          availableTracks: mockTracks,
        }),
      });
      
      const data = await response.json();
      if (data.track) {
        setAiTrack(data.track);
      }
    } catch (error) {
      console.error('Failed to get AI track:', error);
    }
  };

  const playTrack = async (track: Track) => {
    if (!track.spotifyUri || !currentDeviceId || !spotifyToken) return;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentDeviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [track.spotifyUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });
      
      if (response.ok) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', margin: '40px 0', fontSize: '48px' }}>
        Back2Back DJ
      </h1>
      
      {spotifyToken && (
        <SpotifyPlayer 
          token={spotifyToken} 
          onPlayerReady={(deviceId) => setCurrentDeviceId(deviceId)}
          onStateChange={(state) => setIsPlaying(!state.paused)}
        />
      )}
      
      {!spotifyToken ? (
        <SpotifyAuth onAuthSuccess={(token) => setSpotifyToken(token)} />
      ) : !isSessionActive ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ marginBottom: '20px' }}>Ready to start a Back2Back session?</h2>
          <button className="button" onClick={startSession} style={{ fontSize: '20px', padding: '15px 30px' }}>
            Start Session
          </button>
        </div>
      ) : (
        <>
          <SessionInfo session={session} />
          
          <AppInfo />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DJDeck
              title="Human DJ"
              track={humanTrack}
              isPlaying={crossfaderPosition <= 50 && isPlaying}
              onLoadTrack={(track) => loadTrack(track, 'human')}
              onPlayTrack={playTrack}
              volume={100 - crossfaderPosition}
            />
            
            <DJDeck
              title="AI DJ"
              track={aiTrack}
              isPlaying={crossfaderPosition >= 50 && isPlaying}
              onLoadTrack={(track) => loadTrack(track, 'ai')}
              onPlayTrack={playTrack}
              onRequestTrack={requestAITrack}
              volume={crossfaderPosition}
              isAI={true}
            />
          </div>
          
          <Mixer
            crossfaderPosition={crossfaderPosition}
            onCrossfaderChange={setCrossfaderPosition}
          />
          
          {spotifyToken ? (
            <SpotifySearch
              token={spotifyToken}
              onSelectTrack={(track) => loadTrack(track, 'human')}
            />
          ) : (
            <TrackLibrary
              tracks={mockTracks}
              onSelectTrack={(track) => loadTrack(track, 'human')}
            />
          )}
        </>
      )}
      
      {/* Debug Components */}
      {spotifyToken && currentDeviceId && (
        <SpotifyDebug token={spotifyToken} deviceId={currentDeviceId} />
      )}
      
      {isSessionActive && (
        <TrackDebug humanTrack={humanTrack} aiTrack={aiTrack} />
      )}
    </div>
  );
}