
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy • Study Bro App',
    description: 'Privacy Policy for Study Bro App. Learn how we handle your data and protect your privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 min-h-[60vh]">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Privacy Policy
                </h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-gray-300">
                        Content is updating...
                    </p>
                    <p className="text-lg text-slate-600 dark:text-gray-300">
                        Nội dung đang được cập nhật...
                    </p>
                </div>
            </div>
        </div>
    );
}
