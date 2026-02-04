import type { MascotMessage } from './types';

// Time-based greetings
export function getGreeting(): MascotMessage {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      id: 'greeting-morning',
      type: 'greeting',
      text: 'Chào buổi sáng! Bắt đầu ngày mới thật năng suất nhé! ☀️',
      expression: 'happy',
      duration: 5000,
    };
  }

  if (hour >= 12 && hour < 14) {
    return {
      id: 'greeting-lunch',
      type: 'greeting',
      text: 'Trưa rồi! Ăn trưa chưa bạn? 🍜',
      expression: 'happy',
      duration: 5000,
    };
  }

  if (hour >= 14 && hour < 18) {
    return {
      id: 'greeting-afternoon',
      type: 'greeting',
      text: 'Chào buổi chiều! Tiếp tục cố gắng nhé! 💪',
      expression: 'encouraging',
      duration: 5000,
    };
  }

  if (hour >= 18 && hour < 22) {
    return {
      id: 'greeting-evening',
      type: 'greeting',
      text: 'Buổi tối rồi! Làm việc vừa phải thôi nhé! 🌙',
      expression: 'sleepy',
      duration: 5000,
    };
  }

  // Late night (22:00 - 5:00)
  return {
    id: 'greeting-night',
    type: 'greeting',
    text: 'Khuya rồi! Nhớ nghỉ ngơi đủ giấc nhé! 😴',
    expression: 'sleepy',
    duration: 5000,
  };
}

export const GREETINGS: MascotMessage[] = [
  {
    id: 'greeting-welcome',
    type: 'greeting',
    text: 'Chào mừng trở lại! Sẵn sàng học tập chưa? 📚',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'greeting-comeback',
    type: 'greeting',
    text: 'Bạn quay lại rồi! Mình nhớ bạn lắm! 🐕',
    expression: 'excited',
    duration: 5000,
  },
];
