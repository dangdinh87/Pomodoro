import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if Spotify access token exists in cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotify_access_token');

    if (!accessToken) {
      return NextResponse.json({ connected: false });
    }

    // Optional: Validate the token by making a test request to Spotify API
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const profile = await response.json();
        return NextResponse.json({
          connected: true,
          profile: {
            id: profile.id,
            display_name: profile.display_name,
            email: profile.email,
            country: profile.country,
            product: profile.product,
            image: profile.images?.[0]?.url ?? null,
          },
        });
      } else {
        // Token is invalid, clear it
        const res = NextResponse.json({ connected: false });
        res.cookies.delete('spotify_access_token');
        res.cookies.delete('spotify_refresh_token');
        return res;
      }
    } catch (error) {
      console.error('Spotify API validation error:', error);
      // If we can't validate, assume token is still valid (optimistic approach)
      return NextResponse.json({ connected: true });
    }
  } catch (error) {
    console.error('Spotify status check error:', error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
