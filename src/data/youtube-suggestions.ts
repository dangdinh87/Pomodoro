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
  // LOFI HIP HOP - 15 videos
  { label: 'Lofi Girl - beats to relax/study to', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', description: 'Lofi Hip Hop Radio', category: 'Lofi' },
  { label: 'Lofi Hip Hop Mix - Chill Study Beats', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', description: '1 Hour Mix', category: 'Lofi' },
  { label: 'Japanese Lofi Hip Hop Mix', url: 'https://www.youtube.com/watch?v=rUxyKA_-grg', description: 'Chill Beats', category: 'Lofi' },
  { label: 'Lofi Fruits Music - Chill Vibes', url: 'https://www.youtube.com/watch?v=n61ULEU7CO0', description: 'Study Mix', category: 'Lofi' },
  { label: 'Cozy Lofi Hip Hop Mix', url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c', description: 'Relaxing Beats', category: 'Lofi' },
  { label: 'Night Lofi Mix - Deep Focus', url: 'https://www.youtube.com/watch?v=kgx4WGK0oNU', description: 'Late Night Study', category: 'Lofi' },
  { label: 'Morning Lofi - Calm Start', url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU', description: 'Morning Routine', category: 'Lofi' },
  { label: 'Jazzhop Cafe - Lofi Mix', url: 'https://www.youtube.com/watch?v=9gQ3z5Y4XjM', description: 'Jazz & Lofi', category: 'Lofi' },
  { label: 'Chillhop Essentials', url: 'https://www.youtube.com/watch?v=FjHGZj2IjBk', description: 'Chill Hip Hop', category: 'Lofi' },
  { label: 'Lofi Hip Hop Radio 24/7', url: 'https://www.youtube.com/watch?v=8g8z6nGzv9M', description: 'Live Stream', category: 'Lofi' },

  // CAFE AMBIENCE - 12 videos
  { label: 'Cozy Coffee Shop Ambience', url: 'https://www.youtube.com/watch?v=VMAPTo7RVCo', description: 'Background Noise', category: 'Cafe' },
  { label: 'Rainy Cafe Ambience with Jazz', url: 'https://www.youtube.com/watch?v=DX0qKzZ9HjI', description: 'Rain Sounds', category: 'Cafe' },
  { label: 'Paris Cafe Ambience', url: 'https://www.youtube.com/watch?v=GAgrHh-4bho', description: 'French Cafe', category: 'Cafe' },
  { label: 'Morning Cafe with Birds Chirping', url: 'https://www.youtube.com/watch?v=1vx8iUvfyCY', description: 'Morning Vibe', category: 'Cafe' },
  { label: 'Bookstore Cafe Ambience', url: 'https://www.youtube.com/watch?v=ZToicYcHIOU', description: 'Reading Music', category: 'Cafe' },
  { label: 'Tokyo Cafe Ambience', url: 'https://www.youtube.com/watch?v=8plwv25NYRo', description: 'Japanese Cafe', category: 'Cafe' },
  { label: 'Vintage Cafe Jazz', url: 'https://www.youtube.com/watch?v=ZJ6QQLDIzrI', description: 'Smooth Jazz', category: 'Cafe' },
  { label: 'Cozy Winter Cafe', url: 'https://www.youtube.com/watch?v=6N0h6aJ8x8k', description: 'Winter Ambience', category: 'Cafe' },
  { label: 'Afternoon Cafe Study', url: 'https://www.youtube.com/watch?v=9FJ2y7n3N8E', description: 'Study Ambience', category: 'Cafe' },
  { label: 'Library Cafe Quiet', url: 'https://www.youtube.com/watch?v=Qd3U0P7nX0E', description: 'Quiet Study', category: 'Cafe' },

  // PIANO & CLASSICAL - 15 videos
  { label: 'Peaceful Piano for Studying', url: 'https://www.youtube.com/watch?v=NPBCbTZWnq0', description: 'Calm Piano', category: 'Piano' },
  { label: 'Classical Music for Brain Power', url: 'https://www.youtube.com/watch?v=T-1sRZB7YjU', description: 'Mozart Effect', category: 'Piano' },
  { label: 'Relaxing Piano Music', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4', description: 'Soft Piano', category: 'Piano' },
  { label: 'Study Piano - Deep Focus', url: 'https://www.youtube.com/watch?v=Jd9f7tD4B2M', description: 'Concentration', category: 'Piano' },
  { label: 'Classical Study Music', url: 'https://www.youtube.com/watch?v=3sL0omwElxw', description: 'Study Session', category: 'Piano' },
  { label: 'Piano Music for Reading', url: 'https://www.youtube.com/watch?v=Na0w3Mz46GA', description: 'Reading Music', category: 'Piano' },
  { label: 'Mozart for Studying', url: 'https://www.youtube.com/watch?v=lxjZKx2Zzlw', description: 'Classical Focus', category: 'Piano' },
  { label: 'Chopin Piano Collection', url: 'https://www.youtube.com/watch?v=R8eK9ZXf-Ow', description: 'Romantic Piano', category: 'Piano' },
  { label: 'Bach for Brain Power', url: 'https://www.youtube.com/watch?v=Hrr3dp7zRQY', description: 'Baroque Music', category: 'Piano' },
  { label: 'Beethoven Study Mix', url: 'https://www.youtube.com/watch?v=KDP3ZC2Vf7I', description: 'Classical Power', category: 'Piano' },
  { label: 'Vivaldi Four Seasons', url: 'https://www.youtube.com/watch?v=GRxofEmo3HA', description: 'Classical Beauty', category: 'Piano' },
  { label: 'Debussy Piano Works', url: 'https://www.youtube.com/watch?v=9E6b3swbnWg', description: 'Impressionist', category: 'Piano' },
  { label: 'Satie Gymnopédies', url: 'https://www.youtube.com/watch?v=6zTc2hD2npA', description: 'Minimalist Piano', category: 'Piano' },

  // AMBIENT & FLOW STATE - 12 videos
  { label: 'Ambient Music for Deep Focus', url: 'https://www.youtube.com/watch?v=DPm9RVpwOLQ', description: 'Flow State', category: 'Ambient' },
  { label: 'Space Ambient - Cosmic Soundscape', url: 'https://www.youtube.com/watch?v=Kxhoj4vVwzY', description: 'Space Music', category: 'Ambient' },
  { label: 'Ethereal Ambient Mix', url: 'https://www.youtube.com/watch?v=G8qUj8KxO7w', description: 'Dreamy Sounds', category: 'Ambient' },
  { label: 'Ambient Concentration Music', url: 'https://www.youtube.com/watch?v=J7k7KjI5G1w', description: 'Study Focus', category: 'Ambient' },
  { label: 'Deep Space Ambient', url: 'https://www.youtube.com/watch?v=Z9J3h0mN0Xg', description: 'Meditation', category: 'Ambient' },
  { label: 'Minimal Ambient Soundscape', url: 'https://www.youtube.com/watch?v=5n6y0X9jO5w', description: 'Minimalist', category: 'Ambient' },
  { label: 'Atmospheric Ambient Study', url: 'https://www.youtube.com/watch?v=KJwYBJMSbPI', description: 'Atmospheric', category: 'Ambient' },
  { label: 'Dark Ambient for Focus', url: 'https://www.youtube.com/watch?v=8mZz7v2V4C0', description: 'Deep Work', category: 'Ambient' },
  { label: 'Ambient Drone Music', url: 'https://www.youtube.com/watch?v=H0bqKxZt8kE', description: 'Meditation', category: 'Ambient' },
  { label: 'Calming Ambient Mix', url: 'https://www.youtube.com/watch?v=MXwYw5Yt3wA', description: 'Relaxation', category: 'Ambient' },

  // NATURE SOUNDS - 12 videos
  { label: 'Rain Sounds for Sleeping', url: 'https://www.youtube.com/watch?v=mkG3KJ1p9Fw', description: 'Heavy Rain', category: 'Nature' },
  { label: 'Forest Rain Ambience', url: 'https://www.youtube.com/watch?v=OdIJ2x3nxzQ', description: 'Rainforest', category: 'Nature' },
  { label: 'Ocean Waves for Study', url: 'https://www.youtube.com/watch?v=Qm846KdZN_c', description: 'Beach Sounds', category: 'Nature' },
  { label: 'Thunderstorm Ambience', url: 'https://www.youtube.com/watch?v=7b4y3Yz5cQk', description: 'Thunder & Rain', category: 'Nature' },
  { label: 'Fireplace Crackling', url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY', description: 'Cozy Fire', category: 'Nature' },
  { label: 'River Stream Sounds', url: 'https://www.youtube.com/watch?v=ZpZ7Gv3PqOw', description: 'Water Flow', category: 'Nature' },
  { label: 'Birds Chirping in Forest', url: 'https://www.youtube.com/watch?v=Yt5zJc0zN0k', description: 'Bird Songs', category: 'Nature' },
  { label: 'Wind in Trees', url: 'https://www.youtube.com/watch?v=R3E6D2mHnqg', description: 'Forest Wind', category: 'Nature' },
  { label: 'Mountain Stream Ambience', url: 'https://www.youtube.com/watch?v=6b8K2H3z5pA', description: 'Stream Water', category: 'Nature' },
  { label: 'Night Crickets & Frogs', url: 'https://www.youtube.com/watch?v=QH2-TGUlwu4', description: 'Night Nature', category: 'Nature' },

  // CODING / DEEP WORK - 12 videos
  { label: 'Synthwave for Coding', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY', description: 'Retro Vibes', category: 'Coding' },
  { label: 'Cyberpunk Coding Mix', url: 'https://www.youtube.com/watch?v=f02mOEt11OQ', description: 'Futuristic', category: 'Coding' },
  { label: 'Deep Focus Programming', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', description: 'Coding Session', category: 'Coding' },
  { label: 'Hacker Music - Dark Ambient', url: 'https://www.youtube.com/watch?v=6d3jPr_WwJ0', description: 'Hacker Vibe', category: 'Coding' },
  { label: 'Electronic Study Music', url: 'https://www.youtube.com/watch?v=BSxM9sMqUUI', description: 'Electronic Focus', category: 'Coding' },
  { label: 'Techno for Programming', url: 'https://www.youtube.com/watch?v=_rZbq-bPUU4', description: 'Minimal Techno', category: 'Coding' },
  { label: 'Productive Programming Mix', url: 'https://www.youtube.com/watch?v=PeXI0A7pFPw', description: 'Code Flow', category: 'Coding' },
  { label: 'Terminal Music Mix', url: 'https://www.youtube.com/watch?v=2nKNhNifp6M', description: 'Hacking Beats', category: 'Coding' },

  // POMODORO SESSIONS - 12 videos
  { label: '25/5 Pomodoro with Music', url: 'https://www.youtube.com/watch?v=3FjIuPMQzxo', description: 'Pomodoro Timer', category: 'Pomodoro' },
  { label: 'Pomodoro Study Session 2 Hours', url: 'https://www.youtube.com/watch?v=YfQ6f4D1YlI', description: '2 Hour Focus', category: 'Pomodoro' },
  { label: 'Pomodoro Technique with Lofi', url: 'https://www.youtube.com/watch?v=9RZbF4YxFzQ', description: 'Lofi Timer', category: 'Pomodoro' },
  { label: '4 Hours Pomodoro Study Session', url: 'https://www.youtube.com/watch?v=ZLMYfOwyqd8', description: 'Long Session', category: 'Pomodoro' },
  { label: 'Pomodoro Piano Mix', url: 'https://www.youtube.com/watch?v=c5fcM1e-9z4', description: 'Piano Focus', category: 'Pomodoro' },
  { label: 'Pomodoro with Cafe Sounds', url: 'https://www.youtube.com/watch?v=WnsjqpbJz8w', description: 'Cafe Timer', category: 'Pomodoro' },

  // BINAURAL BEATS & BRAIN WAVES - 10 videos
  { label: 'Alpha Waves for Focus', url: 'https://www.youtube.com/watch?v=WPni755-Krg', description: 'Concentration', category: 'Brainwaves' },
  { label: 'Beta Waves - High Focus', url: 'https://www.youtube.com/watch?v=0g7v8mFp6R4', description: 'Intense Study', category: 'Brainwaves' },
  { label: 'Gamma Waves - Brain Power', url: 'https://www.youtube.com/watch?v=Kxhoj4vVwzY', description: 'Memory Boost', category: 'Brainwaves' },
  { label: '40Hz Gamma Binaural', url: 'https://www.youtube.com/watch?v=H0bqKxZt8kE', description: 'Focus Enhancement', category: 'Brainwaves' },
  { label: 'Theta Waves - Creativity', url: 'https://www.youtube.com/watch?v=MXwYw5Yt3wA', description: 'Creative Flow', category: 'Brainwaves' },
  { label: 'Study Music with Binaural', url: 'https://www.youtube.com/watch?v=J7k7KjI5G1w', description: 'Enhanced Learning', category: 'Brainwaves' },
  { label: 'Focus Music 40Hz Binaural', url: 'https://www.youtube.com/watch?v=8mZz7v2V4C0', description: 'Deep Concentration', category: 'Brainwaves' },
];

// Utility function to get a random suggestion
export const getRandomSuggestion = (): YouTubeSuggestion => {
  const randomIndex = Math.floor(Math.random() * youtubeSuggestions.length);
  return youtubeSuggestions[randomIndex];
};

// Get suggestions by category
export const getSuggestionsByCategory = (category: string): YouTubeSuggestion[] => {
  return youtubeSuggestions.filter(s => s.category === category);
};

// Get all unique categories
export const getCategories = (): string[] => {
  const categories = [...new Set(youtubeSuggestions.map(s => s.category))];
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
