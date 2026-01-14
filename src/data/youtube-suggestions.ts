export interface YouTubeSuggestion {
  label: string;
  url: string;
  description: string;
}

export const youtubeSuggestions: YouTubeSuggestion[] = [
  {
    label: 'lofi hip hop radio - beats to relax/study to',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    description: 'Nhạc lofi hip hop thư giãn, hoàn hảo để học tập và nghỉ ngơi.',
  },
  {
    label: 'lofi hip hop radio - beats to study/relax to 🐾 (Chillhop Music)',
    url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU',
    description: 'Kênh lofi hip hop chill giúp tập trung và thư giãn trong lúc học.',
  },
  {
    label: 'Beautiful Relaxing Music for Stress Relief - Meditation, Relaxation, Sleep, Spa',
    url: 'https://www.youtube.com/watch?v=lFcSrYw-ARY',
    description: 'Nhạc thư giãn đẹp giúp giảm căng thẳng, thiền định, ngủ và spa.',
  },
  {
    label: 'Chill Study Beats 2025 - Focus mix / Lofi Pomodoro Timer',
    url: 'https://www.youtube.com/watch?v=V68QAzV_Eqk',
    description: 'Lo-fi chillhop mix dài 2 giờ, tích hợp bộ đếm Pomodoro giúp kiểm soát thời gian học.',
  },
  {
    label: 'Smooth Chill Relaxing Instrumental Background Songs',
    url: 'https://www.youtube.com/watch?v=03vS_hhQH0s',
    description: 'Nhạc nền instrumental chillhop giúp tập trung và thư giãn.',
  },
  {
    label: 'Chill Session 2025 by JJOS – Relax Music',
    url: 'https://www.youtube.com/watch?v=FssEqyQ9_hs',
    description: 'Nhạc chillout tổng hợp tạo không gian thư giãn khi học hoặc nghỉ ngơi.',
  },
  {
    label: 'Chillout Music for Work & Study — Mix for Calm, Focus',
    url: 'https://www.youtube.com/watch?v=DwYF_LufBAR',
    description: 'Nhạc chillout giúp tăng khả năng tập trung cho công việc và học tập.',
  },
  {
    label: 'Lounge Music 2025 — Chill Vibes & Sunset Lounge Mix',
    url: 'https://www.youtube.com/watch?v=PoR_CxXSm5I',
    description: 'Nhạc lounge nhẹ nhàng, vibe chill cho học tập và thư giãn buổi chiều.',
  },
  {
    label: 'Chill Work Music — Calm Focus Mix',
    url: 'https://www.youtube.com/watch?v=RWG3K0xrxVM',
    description: 'Nhạc chillout tăng năng lượng tích cực, giảm stress, tốt cho sự tập trung.',
  },
  {
    label: '1 Hour of Ultimate Work Music for Deep Focus and Efficiency #3',
    url: 'https://www.youtube.com/watch?v=1FhDz0TuUt4',
    description: 'Nhạc làm việc sâu giúp nâng cao hiệu quả và sự tập trung trong các phiên học dài.',
  },
];

// Utility function to get a random suggestion
export const getRandomSuggestion = (): YouTubeSuggestion => {
  const randomIndex = Math.floor(Math.random() * youtubeSuggestions.length);
  return youtubeSuggestions[randomIndex];
};

// Utility function to get YouTube thumbnail URL
export const getYouTubeThumbnailUrl = (videoId: string): string | null => {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

// Utility function to get YouTube embed URL
export const getYouTubeEmbedUrl = (videoId: string): string | null => {
  return videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`
    : null;
};