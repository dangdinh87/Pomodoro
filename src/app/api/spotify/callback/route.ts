import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify authorization error:', error);
      return NextResponse.redirect(new URL('/?spotify_error=authorization_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?spotify_error=no_code', request.url));
    }

    // Exchange the authorization code for an access token
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/spotify/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?spotify_error=missing_credentials', request.url));
    }

    console.log('Attempting token exchange with:', {
      clientId,
      redirectUri,
      codeLength: code.length
    });

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorText,
        redirectUriUsed: redirectUri
      });
      return NextResponse.redirect(new URL('/?spotify_error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();

    // Create a response that sets the access token in a cookie
    const response = NextResponse.redirect(new URL('/?spotify_success=true', request.url));

    // Set the access token in a secure, http-only cookie
    // Note: In production, you should also store refresh token and implement proper token refresh logic
    response.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600, // 1 hour default
      path: '/',
    });

    if (tokenData.refresh_token) {
      response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(new URL('/?spotify_error=callback_failed', request.url));
  }
}
