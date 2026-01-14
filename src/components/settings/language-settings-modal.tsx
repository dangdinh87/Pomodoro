'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LANGS, Lang, useI18n } from '@/contexts/i18n-context';
import { toast } from 'sonner';

export default function LanguageSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { lang, setLang } = useI18n();

  const handleChange = (value: Lang) => {
    if (value === lang) return;
    setLang(value);
    toast.success('Đã cập nhật ngôn ngữ.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt ngôn ngữ</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Chọn ngôn ngữ yêu thích của bạn cho toàn bộ giao diện ứng dụng.
          </p>
        </DialogHeader>
        <RadioGroup
          value={lang}
          onValueChange={(value) => handleChange(value as Lang)}
          className="space-y-3"
        >
          {LANGS.map((item) => (
            <Label
              key={item.code}
              htmlFor={`lang-${item.code}`}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:border-primary"
            >
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.code.toUpperCase()}</span>
              </div>
              <RadioGroupItem
                value={item.code}
                id={`lang-${item.code}`}
              />
            </Label>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

