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
    const { device_id, play } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'device_id required' }, { status: 400 });
    }

    const response = await fetch(
      'https://api.spotify.com/v1/me/player',
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [device_id],
          play: play || false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = 'Failed to transfer playback';
      let errorDetails = errorText;

      // Parse Spotify error response if available
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorMessage;
          errorDetails = JSON.stringify(errorJson.error);
        }
      } catch {
        // If not JSON, use the text as is
        errorDetails = errorText || response.statusText;
      }

      console.error('Spotify API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
      });

      // Provide more specific error messages
      if (response.status === 403) {
        errorMessage = 'Không có quyền điều khiển phát nhạc. Có thể cần tài khoản Spotify Premium hoặc đăng nhập lại.';
      } else if (response.status === 401) {
        errorMessage = 'Token đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (response.status === 404) {
        errorMessage = 'Không tìm thấy thiết bị. Hãy đảm bảo thiết bị đang hoạt động.';
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          status: response.status 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Playback transferred' });
  } catch (error) {
    console.error('Spotify transfer error:', error);
    return NextResponse.json({ error: 'Failed to transfer playback' }, { status: 500 });
  }
}
