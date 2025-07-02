'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Track } from '../types/dj';

interface SpotifySearchProps {
  token: string;
  onSelectTrack: (track: Track) => void;
}

export function SpotifySearch({ token, onSelectTrack }: SpotifySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchTracks = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.tracks) {
        // Fetch audio features for each track
        const tracksWithFeatures = await Promise.all(
          data.tracks.map(async (track: Track) => {
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
        
        setResults(tracksWithFeatures);
      }
    } catch (error) {
      console.error('Failed to search tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTracks(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchTracks]);

  return (
    <div className="track-library">
      <h3 style={{ marginBottom: '20px' }}>Spotify Library</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for tracks..."
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          background: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '16px',
        }}
      />
      
      {isLoading && <p style={{ textAlign: 'center', color: '#888' }}>Searching...</p>}
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {results.map((track) => (
          <div
            key={track.id}
            className="track-item"
            onClick={() => onSelectTrack(track)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {track.albumArt && (
              <img 
                src={track.albumArt} 
                alt={track.title}
                style={{ width: '40px', height: '40px', borderRadius: '4px' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{track.title}</div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                {track.artist} • {track.bpm} BPM • {track.key} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}