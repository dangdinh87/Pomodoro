
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service • Study Bro App',
    description: 'Terms of Service for Study Bro App. Read our terms and conditions for using the application.',
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 min-h-[60vh]">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Terms of Service
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
