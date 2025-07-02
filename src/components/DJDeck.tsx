import { useState } from 'react';
import { Track } from '../types/dj';
import { AudioPlayer } from './AudioPlayer';

interface DJDeckProps {
  title: string;
  track: Track | null;
  isPlaying: boolean;
  onLoadTrack: (track: Track) => void;
  onRequestTrack?: () => void;
  onPlayTrack?: (track: Track) => void;
  volume?: number;
  isAI?: boolean;
}

export function DJDeck({ title, track, isPlaying, onLoadTrack, onRequestTrack, onPlayTrack, volume = 50, isAI }: DJDeckProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestTrack = async () => {
    if (onRequestTrack) {
      setIsLoading(true);
      await onRequestTrack();
      setIsLoading(false);
    }
  };
  return (
    <div className="deck">
      <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>{title}</h3>
      
      {track ? (
        <div className="track-info" style={{ display: 'flex', gap: '15px' }}>
          {track.albumArt && (
            <img 
              src={track.albumArt} 
              alt={track.title}
              style={{ width: '80px', height: '80px', borderRadius: '8px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h4>{track.title}</h4>
            <p style={{ color: '#888', marginTop: '5px' }}>{track.artist}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '14px' }}>
              <span>BPM: {track.bpm}</span>
              <span>Key: {track.key}</span>
              <span>Energy: {track.energy}/10</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="track-info" style={{ textAlign: 'center', color: '#666' }}>
          <p>No track loaded</p>
        </div>
      )}
      
      <AudioPlayer 
        track={track} 
        isActive={isPlaying}
        volume={volume}
      />
      
      <div className="controls">
        {isAI && onRequestTrack && (
          <button 
            className="button" 
            onClick={handleRequestTrack}
            disabled={isLoading}
            style={{ 
              background: isLoading ? '#666' : '#00a8ff',
              cursor: isLoading ? 'wait' : 'pointer' 
            }}
          >
            {isLoading ? '🔄 Searching...' : '🤖 Request AI Selection'}
          </button>
        )}
        <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '10px' }}>
          {isPlaying ? '🎵 Active Deck' : '⏸ Inactive'}
        </div>
      </div>
    </div>
  );
}