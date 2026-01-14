import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotify_access_token');

    if (!accessToken) {
      return NextResponse.json(
        { devices: [], error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call Spotify Web API to get available devices
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Spotify API error:', response.status, response.statusText, errorText);

      // Return more detailed error information
      return NextResponse.json(
        {
          devices: [],
          error: `Spotify API error: ${response.status} ${response.statusText}`,
          details: errorText || undefined
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const devices = data.devices || [];

    // Log if no devices found for debugging
    if (devices.length === 0) {
      console.log('No Spotify devices found. User needs to open Spotify app.');
    }

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Spotify devices error:', error);
    return NextResponse.json(
      {
        devices: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
