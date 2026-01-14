import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotify_access_token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { context_uri, device_id } = body;

    if (!context_uri || !device_id) {
      return NextResponse.json({ error: 'context_uri and device_id required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri,
        }),
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to start playback' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Playback started' });
  } catch (error) {
    console.error('Spotify play error:', error);
    return NextResponse.json({ error: 'Failed to start playback' }, { status: 500 });
  }
}
