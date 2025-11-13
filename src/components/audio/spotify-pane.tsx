'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type SpotifyImage = { url: string; width?: number; height?: number };
type SpotifyPlaylist = {
  id: string;
  name: string;
  uri: string;
  images?: SpotifyImage[];
  owner?: { display_name?: string };
  tracks?: { total?: number };
};
type SpotifyDevice = {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
  is_restricted?: boolean;
};

async function getJSON<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Request failed ${res.status}`);
  }
  return res.json();
}

export default function SpotifyPane() {
  const [connected, setConnected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState<boolean>(false);

  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

  // Check connection on mount
  useEffect(() => {
    (async () => {
      try {
        setChecking(true);
        const st = await getJSON<{ connected: boolean }>('/api/spotify/status');
        setConnected(!!st.connected);
      } catch {
        setConnected(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  // When connected, load playlists and devices
  useEffect(() => {
    if (!connected) return;
    refreshDevices();
    refreshPlaylists();
  }, [connected]);

  const activeDeviceId = useMemo(() => {
    const act = devices.find((d) => d.is_active && d.id);
    return act?.id ?? undefined;
  }, [devices]);

  useEffect(() => {
    if (!selectedDeviceId && activeDeviceId) {
      setSelectedDeviceId(activeDeviceId);
    }
  }, [activeDeviceId, selectedDeviceId]);

  const login = () => {
    window.location.href = '/api/spotify/login';
  };

  const refreshDevices = async () => {
    try {
      setLoadingDevices(true);
      const data = await getJSON<{ devices: SpotifyDevice[] }>('/api/spotify/devices');
      setDevices(data.devices || []);
    } catch (e: any) {
      toast.error('Không tải được danh sách thiết bị Spotify');
    } finally {
      setLoadingDevices(false);
    }
  };

  const refreshPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const data = await getJSON<{ items: SpotifyPlaylist[] }>('/api/spotify/playlists?limit=50');
      setPlaylists(data.items || []);
    } catch (e: any) {
      toast.error('Không tải được playlist Spotify');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const transferToDevice = async (deviceId: string) => {
    const res = await fetch('/api/spotify/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, play: true }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || 'Không thể chuyển thiết bị');
    }
  };

  const playPlaylist = async (playlist: SpotifyPlaylist) => {
    if (!playlist?.uri) {
      toast.error('Playlist không hợp lệ');
      return;
    }
    const deviceId = selectedDeviceId || activeDeviceId;
    if (!deviceId) {
      toast.error('Hãy chọn một thiết bị để phát trên Spotify');
      return;
    }

    try {
      // Ensure device is the active one
      await transferToDevice(deviceId);

      const res = await fetch('/api/spotify/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_uri: playlist.uri,
          device_id: deviceId,
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Không thể phát playlist');
      }
      toast.success(`Đang phát: ${playlist.name}`);
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi khi phát playlist');
    }
  };

  if (checking) {
    return (
      <div className="text-sm text-muted-foreground">Đang kiểm tra trạng thái Spotify...</div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Kết nối Spotify để lấy playlist cá nhân và phát nhạc.
        </div>
        <Button onClick={login}>Đăng nhập với Spotify</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <Label>Thiết bị phát</Label>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={selectedDeviceId ?? ''}
              onChange={(e) => setSelectedDeviceId(e.target.value || undefined)}
            >
              <option value="">Chọn thiết bị...</option>
              {devices.map((d) => (
                <option key={(d.id || d.name) + String(d.is_active)} value={d.id ?? ''}>
                  {d.name} {d.is_active ? '(đang hoạt động)' : ''}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={refreshDevices} disabled={loadingDevices}>
              {loadingDevices ? 'Đang tải...' : 'Tải thiết bị'}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Mẹo: Mở ứng dụng Spotify (máy tính/điện thoại) để xuất hiện trong danh sách thiết bị.
          </div>
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400">Đã kết nối Spotify ✅</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Playlist của bạn</Label>
          <Button variant="outline" size="sm" onClick={refreshPlaylists} disabled={loadingPlaylists}>
            {loadingPlaylists ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
        {playlists.length === 0 ? (
          <div className="text-sm text-muted-foreground">Không có playlist hoặc chưa tải được.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((pl) => {
              const img = pl.images?.[0]?.url;
              return (
                <div
                  key={pl.id}
                  className="p-3 border rounded-lg flex items-center gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded overflow-hidden bg-muted shrink-0">
                    {img ? (
                      <img src={img} alt={pl.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{pl.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {pl.owner?.display_name ?? 'Playlist'}
                    </div>
                    <div className="mt-2">
                      <Button size="sm" onClick={() => playPlaylist(pl)} disabled={!selectedDeviceId && !activeDeviceId}>
                        Phát playlist
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}