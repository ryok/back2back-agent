'use client';

import { useState, useRef, useEffect } from 'react';
import type { Track } from '../types/dj';

interface AudioPlayerProps {
  track: Track | null;
  isActive: boolean;
  volume: number;
  onTrackEnd?: () => void;
}

export function AudioPlayer({ track, isActive, volume, onTrackEnd }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onTrackEnd) onTrackEnd();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTrackEnd]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && track?.previewUrl) {
      audioRef.current.src = track.previewUrl;
      audioRef.current.load();
    }
  }, [track]);

  const play = async () => {
    if (audioRef.current && track?.previewUrl) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!track?.previewUrl) {
    return (
      <div style={{ 
        padding: '10px', 
        background: '#333', 
        borderRadius: '6px', 
        textAlign: 'center',
        color: '#888'
      }}>
        No preview available
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '15px', 
      background: isActive ? '#444' : '#333', 
      borderRadius: '8px',
      border: isActive ? '2px solid #00a8ff' : '2px solid transparent',
    }}>
      <audio ref={audioRef} preload="metadata" />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={isPlaying ? pause : play}
          style={{
            background: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{track.title}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{track.artist}</div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#888' }}>
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </div>
      </div>
      
      {/* Progress bar */}
      <div 
        style={{
          width: '100%',
          height: '4px',
          background: '#555',
          borderRadius: '2px',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          const newTime = percent * duration;
          seek(newTime);
        }}
      >
        <div
          style={{
            width: `${(currentTime / duration) * 100 || 0}%`,
            height: '100%',
            background: '#00a8ff',
            transition: 'width 0.1s',
          }}
        />
      </div>
      
      <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
        Preview (30s) • {track.bpm} BPM • {track.key}
      </div>
    </div>
  );
}