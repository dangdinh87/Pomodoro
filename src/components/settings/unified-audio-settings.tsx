'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Music, Youtube, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemStore } from '@/stores/system-store';
import { AmbientSounds } from '@/components/audio/ambient-sounds';
import { YouTubePlayer } from '@/components/audio/youtube-player';
import SpotifyPane from '@/components/audio/spotify-pane';
import { cn } from '@/lib/utils';

interface UnifiedAudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnifiedAudioSettings({ isOpen, onClose }: UnifiedAudioSettingsProps) {
  const { audioSettings, updateAudioSettings } = useSystemStore();
  const [activeTab, setActiveTab] = useState('ambient');

  const handleSave = () => {
    // Settings are already saved through the individual components
    // This is just for user feedback
    toast.success('Audio settings saved!');
    onClose();
  };

  const tabs = [
    {
      id: 'ambient',
      label: 'Ambient',
      icon: <Volume2 className="h-4 w-4" />,
      content: <AmbientSounds />
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: <Youtube className="h-4 w-4" />,
      content: <YouTubePlayer />
    },
    {
      id: 'spotify',
      label: 'Spotify',
      icon: <Headphones className="h-4 w-4" />,
      content: <SpotifyPane />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <Music className="h-5 w-5" />
            Audio Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {tabs.map(tab => (
              <TabsContent 
                key={tab.id} 
                value={tab.id}
                className={cn(
                  "space-y-6",
                  activeTab === tab.id ? "block" : "hidden"
                )}
              >
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handleSave}>
            Lưu cài đặt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedAudioSettings;
