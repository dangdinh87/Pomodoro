import type { MascotMessage } from './types';

export const TIPS: MascotMessage[] = [
  // Motivational tips
  {
    id: 'tip-1',
    type: 'tip',
    text: 'Bạn đang làm tốt lắm! 💪',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'tip-2',
    type: 'tip',
    text: 'Nghỉ ngơi cũng là năng suất đó!',
    expression: 'sleepy',
    duration: 5000,
  },
  {
    id: 'tip-3',
    type: 'tip',
    text: 'Mỗi phút tập trung đều có giá trị 🎯',
    expression: 'focused',
    duration: 5000,
  },
  {
    id: 'tip-4',
    type: 'tip',
    text: 'Chia nhỏ công việc để dễ hoàn thành hơn!',
    expression: 'encouraging',
    duration: 5000,
  },
  {
    id: 'tip-5',
    type: 'tip',
    text: 'Uống nước đi bạn ơi! 💧',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'tip-6',
    type: 'tip',
    text: 'Giãn cơ một chút để tăng năng lượng!',
    expression: 'excited',
    duration: 5000,
  },
  {
    id: 'tip-7',
    type: 'tip',
    text: 'Tắt thông báo để tập trung tốt hơn 📵',
    expression: 'focused',
    duration: 5000,
  },
  {
    id: 'tip-8',
    type: 'tip',
    text: 'Bạn đã nghỉ mắt chưa? 👀',
    expression: 'sleepy',
    duration: 5000,
  },
  {
    id: 'tip-9',
    type: 'tip',
    text: 'Kiên trì là chìa khóa thành công!',
    expression: 'encouraging',
    duration: 5000,
  },
  {
    id: 'tip-10',
    type: 'tip',
    text: 'Hít thở sâu để thư giãn nhé! 🧘',
    expression: 'happy',
    duration: 5000,
  },
  // Focus tips
  {
    id: 'tip-11',
    type: 'tip',
    text: 'Một task một lúc thôi nhé! 🎯',
    expression: 'focused',
    duration: 5000,
  },
  {
    id: 'tip-12',
    type: 'tip',
    text: 'Bạn còn nhớ mục tiêu hôm nay chứ?',
    expression: 'encouraging',
    duration: 5000,
  },
  {
    id: 'tip-13',
    type: 'tip',
    text: 'Tập trung 25 phút thôi, bạn làm được! 🍅',
    expression: 'focused',
    duration: 5000,
  },
  {
    id: 'tip-14',
    type: 'tip',
    text: 'Đừng để mạng xã hội làm phân tâm nhé!',
    expression: 'worried',
    duration: 5000,
  },
  // Break tips
  {
    id: 'tip-15',
    type: 'tip',
    text: 'Đứng dậy đi lại một chút nào! 🚶',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'tip-16',
    type: 'tip',
    text: 'Nhìn ra xa 20 giây để mắt đỡ mỏi 👁️',
    expression: 'sleepy',
    duration: 5000,
  },
  {
    id: 'tip-17',
    type: 'tip',
    text: 'Break ngắn giúp não làm việc hiệu quả hơn!',
    expression: 'encouraging',
    duration: 5000,
  },
  // Encouragement
  {
    id: 'tip-18',
    type: 'tip',
    text: 'Mỗi bước nhỏ đều quan trọng! 🌟',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'tip-19',
    type: 'tip',
    text: 'Bạn đang tiến bộ từng ngày đấy!',
    expression: 'excited',
    duration: 5000,
  },
  {
    id: 'tip-20',
    type: 'tip',
    text: 'Khó khăn chỉ là tạm thời thôi! 💫',
    expression: 'encouraging',
    duration: 5000,
  },
  // Health tips
  {
    id: 'tip-21',
    type: 'tip',
    text: 'Ngồi thẳng lưng nào! 🪑',
    expression: 'focused',
    duration: 5000,
  },
  {
    id: 'tip-22',
    type: 'tip',
    text: 'Ăn snack healthy để giữ năng lượng 🥗',
    expression: 'happy',
    duration: 5000,
  },
  {
    id: 'tip-23',
    type: 'tip',
    text: 'Bạn ngủ đủ giấc chưa? 😴',
    expression: 'sleepy',
    duration: 5000,
  },
  // Fun tips
  {
    id: 'tip-24',
    type: 'tip',
    text: 'Mình tin bạn! Cố lên! 🐕',
    expression: 'excited',
    duration: 5000,
  },
  {
    id: 'tip-25',
    type: 'tip',
    text: '*vẫy đuôi* Bạn giỏi lắm!',
    expression: 'happy',
    duration: 5000,
  },
];

// Get random tip
export function getRandomTip(): MascotMessage {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

// Get tip by category
export function getTipByExpression(expression: MascotMessage['expression']): MascotMessage {
  const filtered = TIPS.filter((tip) => tip.expression === expression);
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : TIPS[0];
}
