import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '../../../../../lib/spotify';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();

    const response = NextResponse.json({ success: true });

    // Update access token cookie
    response.cookies.set('spotify_access_token', data.body['access_token'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.body['expires_in'],
    });

    // Update refresh token if provided
    if (data.body['refresh_token']) {
      response.cookies.set('spotify_refresh_token', data.body['refresh_token'], {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}