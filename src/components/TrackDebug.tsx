'use client';

import type { Track } from '../types/dj';

interface TrackDebugProps {
  humanTrack: Track | null;
  aiTrack: Track | null;
}

export function TrackDebug({ humanTrack, aiTrack }: TrackDebugProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: '#222',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '11px',
      maxWidth: '400px',
      maxHeight: '200px',
      overflow: 'auto',
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Track Debug Info</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Human Track:</strong>
        {humanTrack ? (
          <div style={{ marginLeft: '10px' }}>
            • {humanTrack.title} - {humanTrack.artist}<br/>
            • BPM: {humanTrack.bpm} | Key: {humanTrack.key}<br/>
            • Preview: {humanTrack.previewUrl ? '✅' : '❌'}<br/>
            • Spotify ID: {humanTrack.spotifyId || 'N/A'}
          </div>
        ) : (
          <span style={{ color: '#888' }}> None loaded</span>
        )}
      </div>
      
      <div>
        <strong>AI Track:</strong>
        {aiTrack ? (
          <div style={{ marginLeft: '10px' }}>
            • {aiTrack.title} - {aiTrack.artist}<br/>
            • BPM: {aiTrack.bpm} | Key: {aiTrack.key}<br/>
            • Preview: {aiTrack.previewUrl ? '✅' : '❌'}<br/>
            • Spotify ID: {aiTrack.spotifyId || 'N/A'}
          </div>
        ) : (
          <span style={{ color: '#888' }}> None selected</span>
        )}
      </div>
    </div>
  );
}