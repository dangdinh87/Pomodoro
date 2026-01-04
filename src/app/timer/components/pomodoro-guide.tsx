'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Info, Sparkles, Target } from 'lucide-react';
import { memo, useEffect, useState, useMemo } from 'react';

export const PomodoroGuide = memo(() => {
  const [showGuide, setShowGuide] = useState<boolean>(true);

  const quotes = useMemo(
    () => [
      'Hãy tập trung vào điều bạn có thể kiểm soát — từng Pomodoro một.',
      'Nhỏ nhưng đều đặn sẽ tạo nên khác biệt lớn.',
      'Kỷ luật thắng tài năng khi tài năng thiếu kỷ luật.',
      'Làm việc sâu trong ngắn hạn, thành tựu lớn trong dài hạn.',
      'Bắt đầu ngay bây giờ — hành động đánh bại trì hoãn.',
    ],
    [],
  );

  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [quotes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('pomodoro-guide-dismissed') === '1';
    setShowGuide(!dismissed);
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pomodoro-guide-dismissed', '1');
      }
    } catch {}
  };

  const reopenGuide = () => {
    setShowGuide(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pomodoro-guide-dismissed');
      }
    } catch {}
  };

  if (!showGuide) {
    return (
      <Button
        onClick={reopenGuide}
        aria-label="Mở hướng dẫn Pomodoro"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition px-3 py-2"
        variant="outline"
        title="Mở hướng dẫn Pomodoro"
      >
        <span className="inline-flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden md:inline">Hướng dẫn</span>
        </span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)]">
      <div className="rounded-xl border border-white/20 bg-background/95 backdrop-blur-md shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-primary">
            <Info className="h-4 w-4 opacity-90" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Hướng dẫn Pomodoro</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={dismissGuide}
                aria-label="Ẩn hướng dẫn"
                title="Ẩn hướng dẫn"
              >
                Ẩn
              </Button>
            </div>

            {/* 1) Giải thích */}
            <div className="mt-3 space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <BookOpen className="h-4 w-4" />
                <span>Giải thích</span>
              </div>
              <p>
                Pomodoro = làm 25’, nghỉ 5’ để giữ tập trung và giảm xao
                nhãng.
              </p>
              <p>Hoàn thành 4 phiên → nghỉ dài 15’ để phục hồi.</p>
            </div>

            {/* 2) Cách sử dụng */}
            <div className="pt-3 border-t space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Target className="h-4 w-4" />
                <span>Cách sử dụng</span>
              </div>
              <ol className="mt-1 list-decimal pl-4 space-y-1">
                <li>Chọn nhiệm vụ và chế độ Work.</li>
                <li>
                  Start/Pause (Space), Reset (R), Skip để chuyển phiên.
                </li>
                <li>Hết phiên → nghỉ Short; 4 Work → nghỉ Long.</li>
                <li>Tùy chỉnh thời lượng/đồng hồ trong Cài đặt.</li>
              </ol>
            </div>

            {/* 3) Mẹo */}
            <div className="pt-3 border-t space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mẹo</span>
              </div>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                <li>Đặt mục tiêu nhỏ, cụ thể cho mỗi phiên.</li>
                <li>Tắt thông báo và đóng tab không cần thiết.</li>
                <li>Tránh đa nhiệm; ghi chú gián đoạn rồi quay lại.</li>
              </ul>
            </div>

            {/* 4) Động lực */}
            <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-xs flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary" />
              <p className="italic leading-relaxed">
                {quote || 'Tập trung vào bước tiếp theo — rồi lặp lại.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PomodoroGuide.displayName = 'PomodoroGuide';
