import { NextResponse } from 'next/server';
import { generateAuthUrl } from '../../../../../lib/spotify';

export async function GET() {
  // Debug: Check if environment variables are set
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
    console.error('Missing Spotify environment variables:', {
      clientId: !!process.env.SPOTIFY_CLIENT_ID,
      clientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
    return NextResponse.json(
      { error: 'Spotify configuration missing. Please check your .env file.' },
      { status: 500 }
    );
  }

  const { url, state } = generateAuthUrl();
  
  // Debug: Log the generated URL
  console.log('Generated Spotify auth URL:', url);
  console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);
  
  // In production, you'd want to store the state in a session
  const response = NextResponse.redirect(url);
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });
  
  return response;
}