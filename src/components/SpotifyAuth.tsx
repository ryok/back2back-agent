'use client';

interface SpotifyAuthProps {
  onAuthSuccess?: (token: string) => void;
}

export function SpotifyAuth({ onAuthSuccess }: SpotifyAuthProps) {
  const handleLogin = () => {
    // Clear any existing auth cookies first
    document.cookie = 'spotify_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'spotify_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    setTimeout(() => {
      window.location.href = '/api/auth/spotify/login';
    }, 100);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ marginBottom: '20px' }}>Connect to Spotify</h2>
      <p style={{ marginBottom: '30px', color: '#888' }}>
        To use Back2Back DJ, you need to connect your Spotify account
      </p>
      <button 
        className="button" 
        onClick={handleLogin}
        style={{ 
          fontSize: '18px', 
          padding: '15px 30px',
          background: '#1DB954',
        }}
      >
        Login with Spotify
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        You'll need a Spotify Premium account for playback control
      </p>
    </div>
  );
}