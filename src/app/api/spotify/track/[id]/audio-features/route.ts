import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '../../../../../../lib/spotify';

const keyMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getAudioFeaturesForTrack(params.id);
    
    const features = response.body;
    
    return NextResponse.json({
      bpm: Math.round(features.tempo),
      key: keyMap[features.key] || 'C',
      energy: Math.round(features.energy * 10),
      danceability: features.danceability,
      valence: features.valence,
      acousticness: features.acousticness,
      instrumentalness: features.instrumentalness,
    });
  } catch (error) {
    console.error('Failed to get audio features:', error);
    return NextResponse.json(
      { error: 'Failed to get audio features' },
      { status: 500 }
    );
  }
}