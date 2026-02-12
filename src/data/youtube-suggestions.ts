export interface YouTubeSuggestion {
  label: string;
  url: string;
  description: string;
  category: string;
}

/**
 * Curated YouTube Study Music Collection
 * 100 handpicked videos organized by study mode
 * All duplicates removed, optimized for Pomodoro focus sessions
 */
export const youtubeSuggestions: YouTubeSuggestion[] = [
  // ==========================================
  // 1. CHILL VN (Vietnamese Lofi/Indie)
  // ==========================================
  {
    label: 'Playlist Nhạc Speed Up Chill Nhẹ Nhàng Để Học Bài Cực Cuốn | Deven',
    url: 'https://www.youtube.com/watch?v=04RM0CQPLHQ',
    description: 'Nhạc Indie Việt nhẹ nhàng 🌿',
    category: 'Chill VN',
  },
  {
    label: 'Những Bản Piano Cover Cảm Xúc Nhất Của An Coong || An Coong 2023',
    url: 'https://www.youtube.com/watch?v=rHKCWKZA6RI',
    description: 'V-Pop Lofi Chill 🌧️',
    category: 'Chill VN',
  },
  {
    label: 'WREN EVANS - NỔ | Full Album Experience (ft. itsnk)',
    url: 'https://www.youtube.com/watch?v=hlf95p9JAGA&t=1352s',
    description: 'Nhạc trẻ tâm trạng 🍂',
    category: 'Chill VN',
  },
  {
    label:
      'Từng Là, Giữa Đại Lộ Đông Tây, Thu Cuối, Có Em Chờ - Những Bản Hits Nhạc Trẻ Nhẹ Nhàng Cực Chill',
    url: 'https://www.youtube.com/watch?v=m7Wya6Z-QdM&t=39s',
    description: 'Indie hay nhất 🎧',
    category: 'Chill VN',
  },
  {
    label:
      'Em quay đi ta mất nhau...Nhắn Nhủ, Mất Kết Nối, Chuyện Đôi Ta - Nhạc Việt Lofi Chill Tâm Trạng Buồn',
    url: 'https://www.youtube.com/watch?v=h-RhopEcbrk',
    description: 'Vibe quán cà phê 🍰',
    category: 'Chill VN',
  },
  {
    label:
      'Thằng Điên, Vì Anh Đâu Có Biết, Bình Yên, Bạc Phận - Những Bản Hits Nhạc Trẻ Cực Chill Gây Nghiện',
    url: 'https://www.youtube.com/watch?v=_y_u5pNLekk',
    description: 'Giai điệu buồn da diết 💔',
    category: 'Chill VN',
  },
  {
    label:
      '𝐏𝐥𝐚𝐲𝐥𝐢𝐬𝐭 thanh âm của Đại Dương Đen update',
    url: 'https://www.youtube.com/watch?v=1IKDDJE7Qb0',
    description: '𝐏𝐥𝐚𝐲𝐥𝐢𝐬𝐭 thanh âm của Đại Dương Đen',
    category: 'Chill VN',
  },


  // ==========================================
  // 2. LOFI HIP HOP / CHILL (15 videos)
  // ==========================================
  {
    label: 'Lofi Girl - beats to relax/study to',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    description: 'Radio Lofi huyền thoại (Live)',
    category: 'Lofi',
  },
  {
    label: 'Synthwave Radio - Beats to Chill/Game',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    description: 'Nhạc điện tử retro (Live)',
    category: 'Lofi',
  },
  {
    label: '1 A.M Study Session',
    url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    description: 'Nhạc đêm khuya tĩnh lặng',
    category: 'Lofi',
  },
  {
    label: 'Code-fi / Lofi Beats to Code',
    url: 'https://www.youtube.com/watch?v=f02mOEt11OQ',
    description: 'Nhịp điệu cho coder',
    category: 'Lofi',
  },
  {
    label: 'Sleepy Lofi Beats',
    url: 'https://www.youtube.com/watch?v=gnZImHvA0ME',
    description: 'Buồn ngủ, nhẹ nhàng',
    category: 'Lofi',
  },
  {
    label: 'Zelda Lofi - Hyrule Café',
    url: 'https://www.youtube.com/watch?v=HGI-LDyY5s8',
    description: 'Nhạc game Zelda bản Chill',
    category: 'Lofi',
  },
  {
    label: 'Japanese City Pop Lofi',
    url: 'https://www.youtube.com/watch?v=9FvvbVI5rYA',
    description: 'Vibe Nhật Bản thập niên 80',
    category: 'Lofi',
  },

  // ==========================================
  // 3. CAFE & LIBRARY AMBIENCE (15 videos)
  // ==========================================
  {
    label: 'Starbucks Jazz Music',
    url: 'https://www.youtube.com/watch?v=VMAPTo7RVCo',
    description: 'Nhạc nền Starbucks',
    category: 'Cafe',
  },
  {
    label: 'Hogwarts Library Ambience',
    url: 'https://www.youtube.com/watch?v=bwSibZ8mnrQ',
    description: 'Thư viện Harry Potter',
    category: 'Cafe',
  },
  {
    label: 'New York Jazz Lounge',
    url: 'https://www.youtube.com/watch?v=FjHGZj2IjBk',
    description: 'Nhạc Jazz hiện đại',
    category: 'Cafe',
  },
  {
    label: 'Rainy Night Coffee Shop',
    url: 'https://www.youtube.com/watch?v=c0_ejQQcrwI',
    description: 'Mưa đêm ấm áp',
    category: 'Cafe',
  },
  {
    label: 'Library Sounds Study Ambience',
    url: 'https://www.youtube.com/watch?v=4vIQON2fDWM',
    description: 'Tiếng lật sách, viết bút',
    category: 'Cafe',
  },
  {
    label: 'Quiet Study Room',
    url: 'https://www.youtube.com/watch?v=DPm9RVpwOLQ',
    description: 'Phòng học yên tĩnh',
    category: 'Cafe',
  },
  {
    label: 'Seaside Coffee Shop',
    url: 'https://www.youtube.com/watch?v=1vx8iUvfyCY',
    description: 'Cafe view biển',
    category: 'Cafe',
  },

  // ==========================================
  // 4. PIANO & CLASSICAL (15 videos)
  // ==========================================
  {
    label: 'Classical Music for Studying',
    url: 'https://www.youtube.com/watch?v=4eAICm5vg6E',
    description: 'Halidon - Nhạc cổ điển',
    category: 'Piano',
  },
  {
    label: 'Mozart Brain Power',
    url: 'https://www.youtube.com/watch?v=Rb0UmrCXxVA',
    description: 'Hiệu ứng Mozart',
    category: 'Piano',
  },
  {
    label: 'Dark Academia Classical',
    url: 'https://www.youtube.com/watch?v=XGC80iRS7tw',
    description: 'Vibe quý tộc, bí ẩn',
    category: 'Piano',
  },
  {
    label: 'Yiruma - River Flows in You',
    url: 'https://www.youtube.com/watch?v=NPBCbTZWnq0',
    description: 'Piano hiện đại bất hủ',
    category: 'Piano',
  },
  {
    label: 'Ghibli Piano Collection',
    url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU',
    description: 'Nhạc phim Ghibli Piano',
    category: 'Piano',
  },
  {
    label: 'Chopin Nocturnes',
    url: 'https://www.youtube.com/watch?v=9E6b3swbnWg',
    description: 'Nhạc đêm Chopin',
    category: 'Piano',
  },
  {
    label: 'Debussy - Clair de Lune',
    url: 'https://www.youtube.com/watch?v=CvFH_6DNRCY',
    description: 'Ánh trăng nhẹ nhàng',
    category: 'Piano',
  },
  {
    label: 'Beethoven - Moonlight Sonata',
    url: 'https://www.youtube.com/watch?v=4Tr0otuiQuU',
    description: 'Sonata Ánh trăng',
    category: 'Piano',
  },
  {
    label: 'Disney Piano Collection',
    url: 'https://www.youtube.com/watch?v=3sL0omwElxw',
    description: 'Nhạc Disney thư giãn',
    category: 'Piano',
  },
  {
    label: 'Sad Piano Music',
    url: 'https://www.youtube.com/watch?v=s71I_EWJk7I',
    description: 'Piano tâm trạng buồn',
    category: 'Piano',
  },
  {
    label: 'Bach - Cello Suites',
    url: 'https://www.youtube.com/watch?v=1prweT95Mo0',
    description: 'Nhạc Cello trầm ấm',
    category: 'Piano',
  },
  {
    label: 'Erik Satie - Gymnopédies',
    url: 'https://www.youtube.com/watch?v=_bdOTUocn5w',
    description: 'Piano tối giản',
    category: 'Piano',
  },
  {
    label: 'Tchaikovsky - Swan Lake',
    url: 'https://www.youtube.com/watch?v=9_7loz-HWUM',
    description: 'Hồ Thiên Nga',
    category: 'Piano',
  },
  {
    label: 'Vivaldi - Four Seasons',
    url: 'https://www.youtube.com/watch?v=GRxofEmo3HA',
    description: 'Bốn Mùa - Sôi động',
    category: 'Piano',
  },
  {
    label: 'Romantic Piano List',
    url: 'https://www.youtube.com/watch?v=R8eK9ZXf-Ow',
    description: 'Piano lãng mạn',
    category: 'Piano',
  },

  // ==========================================
  // 5. NATURE & WHITE NOISE (10 videos)
  // ==========================================
  {
    label: 'Heavy Rain Black Screen',
    url: 'https://www.youtube.com/watch?v=Lx4-RIC-jkM',
    description: 'Mưa lớn màn hình đen',
    category: 'Nature',
  },
  {
    label: 'Thunderstorm for Sleep',
    url: 'https://www.youtube.com/watch?v=nDq6TstdEi8',
    description: 'Sấm chớp mưa rào',
    category: 'Nature',
  },
  {
    label: 'Ocean Waves White Noise',
    url: 'https://www.youtube.com/watch?v=bn9F19Hi1Lk',
    description: 'Sóng biển rì rào',
    category: 'Nature',
  },
  {
    label: 'Blizzard Wind Sounds',
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    description: 'Tiếng gió bão tuyết',
    category: 'Nature',
  },
  {
    label: 'Brown Noise (Low Freq)',
    url: 'https://www.youtube.com/watch?v=RqzGzwTY-6w',
    description: 'Tiếng ồn nâu trầm',
    category: 'Nature',
  },

  // ==========================================
  // 6. AMBIENT & FANTASY (15 videos)
  // ==========================================
  {
    label: 'Minecraft Music (C418)',
    url: 'https://www.youtube.com/watch?v=Dg0IjOzopYU',
    description: 'Nhạc Minecraft gốc',
    category: 'Ambient',
  },
  {
    label: 'Minecraft + Rain Ambience',
    url: 'https://www.youtube.com/watch?v=9_xZ1QwR08E',
    description: 'Minecraft trời mưa',
    category: 'Ambient',
  },
  {
    label: 'Hogwarts Legacy Autumn',
    url: 'https://www.youtube.com/watch?v=l_EUux-LBe0',
    description: 'Hogwarts mùa thu',
    category: 'Ambient',
  },
  {
    label: 'Lord of the Rings Shire',
    url: 'https://www.youtube.com/watch?v=30b7_S0paCQ',
    description: 'Ngôi làng Hobbit',
    category: 'Ambient',
  },
  {
    label: 'Blade Runner 2049',
    url: 'https://www.youtube.com/watch?v=FjHGZj2IjBk',
    description: 'Vibe Blade Runner',
    category: 'Ambient',
  },
  {
    label: 'Deep Focus - Quiet Quest',
    url: 'https://www.youtube.com/watch?v=oPVte6aMprI',
    description: 'Nhạc tập trung sâu',
    category: 'Ambient',
  },

  // ==========================================
  // 7. CODING / DEEP WORK (10 videos)
  // ==========================================
  {
    label: 'Best of Chillstep 2024',
    url: 'https://www.youtube.com/watch?v=tXB7odE1HuA',
    description: 'Chillstep cho Coder',
    category: 'Coding',
  },
  {
    label: 'Flow State Techno',
    url: 'https://www.youtube.com/watch?v=M5QY2_8704o',
    description: 'Minimal Techno',
    category: 'Coding',
  },
  {
    label: 'Dub Techno for Work',
    url: 'https://www.youtube.com/watch?v=2nKNhNifp6M',
    description: 'Dub Techno 4h',
    category: 'Coding',
  },

  // ==========================================
  // 8. POMODORO / STUDY WITH ME (10 videos)
  // ==========================================
  {
    label: '4H Study With Me (50/10)',
    url: 'https://www.youtube.com/watch?v=jr5JjBBrdPs',
    description: 'Jawonee - 50p học 10p nghỉ',
    category: 'Pomodoro',
  },
  {
    label: '2H Study with Me (25/5)',
    url: 'https://www.youtube.com/watch?v=3xcGh4KHJQc',
    description: 'Hanoi Chamomile 2h',
    category: 'Pomodoro',
  },
  {
    label: '3H Pomodoro with Fireplace',
    url: 'https://www.youtube.com/watch?v=sKc8y-Rh95w',
    description: 'Lò sưởi ấm áp',
    category: 'Pomodoro',
  },
  {
    label: 'James Scholz 12 Hours',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    description: 'Marathon học tập',
    category: 'Pomodoro',
  },

  // ==========================================
  // 9. BRAINWAVES & BINAURAL (10 videos)
  // ==========================================
  {
    label: 'Super Intelligence 14Hz',
    url: 'https://www.youtube.com/watch?v=u2RvqKCn7S4',
    description: 'Kích thích trí nhớ',
    category: 'Brainwaves',
  },
];

// Utility function to get a random suggestion
export const getRandomSuggestion = (): YouTubeSuggestion => {
  const randomIndex = Math.floor(Math.random() * youtubeSuggestions.length);
  return youtubeSuggestions[randomIndex];
};

// Get suggestions by category
export const getSuggestionsByCategory = (
  category: string,
): YouTubeSuggestion[] => {
  return youtubeSuggestions.filter((s) => s.category === category);
};

// Get all unique categories
export const getCategories = (): string[] => {
  const categories = [...new Set(youtubeSuggestions.map((s) => s.category))];
  return categories;
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
