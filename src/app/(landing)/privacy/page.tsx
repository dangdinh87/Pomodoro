

// Since this is a server component, we can probably just use the dictionary directly 
// or simpler: just client component with useTranslation if we want to be consistent with others.
// But checking other pages... page.tsx in (landing) might be server or client.
// Let's use a client component for consistency with the rest of the landing components seen so far
// actually, let's keep it simple.

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
