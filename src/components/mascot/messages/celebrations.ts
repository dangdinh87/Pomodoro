import type { MascotMessage } from './types';

export const CELEBRATIONS: MascotMessage[] = [
  {
    id: 'celebration-task',
    type: 'celebration',
    text: 'Tuyệt vời! Hoàn thành task rồi! 🎉',
    expression: 'celebrating',
    duration: 4000,
  },
  {
    id: 'celebration-pomodoro',
    type: 'celebration',
    text: 'Một pomodoro nữa hoàn thành! Giỏi lắm! 🍅',
    expression: 'excited',
    duration: 4000,
  },
  {
    id: 'celebration-break',
    type: 'celebration',
    text: 'Nghỉ ngơi xứng đáng! Bạn đã làm việc chăm chỉ! ☕',
    expression: 'happy',
    duration: 4000,
  },
  {
    id: 'celebration-level-up',
    type: 'celebration',
    text: 'LEVEL UP! Bạn đang tiến bộ rất nhanh! 🚀',
    expression: 'celebrating',
    duration: 5000,
  },
  {
    id: 'celebration-milestone',
    type: 'celebration',
    text: 'Wow! Một cột mốc mới! Bạn thật tuyệt vời! ⭐',
    expression: 'celebrating',
    duration: 5000,
  },
  {
    id: 'celebration-5-pomodoros',
    type: 'celebration',
    text: '5 pomodoros hôm nay! Cứ tiếp tục thế này nhé! 🔥',
    expression: 'excited',
    duration: 4000,
  },
  {
    id: 'celebration-10-pomodoros',
    type: 'celebration',
    text: '10 pomodoros! Bạn là ngôi sao! ⭐',
    expression: 'celebrating',
    duration: 5000,
  },
];

export function getRandomCelebration(): MascotMessage {
  return CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
}

// Get celebration by event type
export function getCelebrationForEvent(
  event: 'task' | 'pomodoro' | 'milestone' | 'break'
): MascotMessage {
  const filtered = CELEBRATIONS.filter((c) => c.id.includes(event));
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : CELEBRATIONS[0];
}
