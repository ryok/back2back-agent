import { Track } from '../types/dj';

interface TrackLibraryProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export function TrackLibrary({ tracks, onSelectTrack }: TrackLibraryProps) {
  return (
    <div className="track-library">
      <h3 style={{ marginBottom: '20px' }}>Track Library</h3>
      {tracks.map((track) => (
        <div
          key={track.id}
          className="track-item"
          onClick={() => onSelectTrack(track)}
        >
          <div style={{ fontWeight: 'bold' }}>{track.title}</div>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
            {track.artist} • {track.bpm} BPM • {track.key} • {track.genre}
          </div>
        </div>
      ))}
    </div>
  );
}