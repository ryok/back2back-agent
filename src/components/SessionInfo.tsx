import { DJSession } from '../types/dj';

interface SessionInfoProps {
  session: DJSession | null;
}

export function SessionInfo({ session }: SessionInfoProps) {
  if (!session) return null;
  
  return (
    <div className="session-info">
      <h2>Session Active</h2>
      <p style={{ color: '#888', marginTop: '10px' }}>
        {session.humanDJ} x {session.agentDJ}
      </p>
      <p style={{ marginTop: '10px' }}>
        Tracks played: {session.tracks.length}
      </p>
    </div>
  );
}