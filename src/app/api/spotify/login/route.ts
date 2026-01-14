import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Redirect to Spotify OAuth
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/spotify/callback';
    
    if (!clientId) {
      return NextResponse.json({ error: 'Spotify client ID not configured' }, { status: 500 });
    }

    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'user-read-recently-played',
      'user-top-read'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Spotify login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
