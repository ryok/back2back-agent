import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '../../../../../lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url));
  }
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
  }
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Store tokens in cookies (in production, use secure session storage)
    response.cookies.set('spotify_access_token', data.body['access_token'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.body['expires_in'],
    });
    
    response.cookies.set('spotify_refresh_token', data.body['refresh_token'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
  }
}