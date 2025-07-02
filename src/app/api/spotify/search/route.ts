import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '../../../../lib/spotify';
import type { Track } from '../../../../types/dj';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const accessToken = request.cookies.get('spotify_access_token')?.value;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.searchTracks(query, { limit: 20 });
    
    const tracks: Track[] = response.body.tracks?.items.map((track, index) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      bpm: 128, // Spotify doesn't provide BPM in search results
      key: 'C', // Would need audio features API for real key
      duration: Math.floor(track.duration_ms / 1000),
      genre: 'Electronic', // Would need additional API calls
      energy: 7, // Would need audio features API
      spotifyUri: track.uri,
      spotifyId: track.id,
      previewUrl: track.preview_url,
      albumArt: track.album.images[0]?.url,
    })) || [];

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Failed to search tracks:', error);
    return NextResponse.json(
      { error: 'Failed to search tracks' },
      { status: 500 }
    );
  }
}