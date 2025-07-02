'use client';

import { useState, useEffect } from 'react';

interface SpotifyDebugProps {
  token: string;
  deviceId: string;
}

export function SpotifyDebug({ token, deviceId }: SpotifyDebugProps) {
  const [devices, setDevices] = useState<any[]>([]);
  const [activeDevice, setActiveDevice] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    if (!token) return;

    const checkDevices = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 429) {
          console.warn('Rate limited, skipping devices check');
          return;
        }
        
        const data = await response.json();
        setDevices(data.devices || []);
        setActiveDevice(data.devices?.find((d: any) => d.is_active));
      } catch (error) {
        console.error('Failed to get devices:', error);
      }
    };

    const getCurrentTrack = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 429) {
          console.warn('Rate limited, skipping current track check');
          return;
        }
        
        if (response.ok && response.status !== 204) {
          const data = await response.json();
          setCurrentTrack(data);
        }
      } catch (error) {
        console.error('Failed to get current track:', error);
      }
    };

    checkDevices();
    getCurrentTrack();
    
    // Reduce frequency to avoid rate limiting
    const interval = setInterval(() => {
      checkDevices();
      getCurrentTrack();
    }, 10000); // Changed from 5000 to 10000

    return () => clearInterval(interval);
  }, [token]);

  const activateDevice = async () => {
    if (!deviceId || !token) return;

    try {
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
      console.log('Device activated');
    } catch (error) {
      console.error('Failed to activate device:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#222', 
      padding: '15px', 
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000,
    }}>
      <h4>Spotify Debug Info</h4>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Web Player Device ID:</strong> {deviceId || 'Not ready'}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Available Devices ({devices.length}):</strong>
        {devices.map((device, index) => (
          <div key={index} style={{ 
            marginLeft: '10px', 
            color: device.is_active ? '#00ff00' : '#888',
            fontSize: '11px'
          }}>
            • {device.name} ({device.type}) {device.is_active ? '(Active)' : ''}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Active Device:</strong> {activeDevice?.name || 'None'}
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Current Track:</strong> {currentTrack?.item?.name || 'None'}
      </div>

      {deviceId && !activeDevice?.id?.includes(deviceId) && (
        <button 
          onClick={activateDevice}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            fontSize: '11px',
            background: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Activate Web Player
        </button>
      )}
    </div>
  );
}