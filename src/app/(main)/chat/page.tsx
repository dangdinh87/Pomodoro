"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
    useChatRuntime,
    AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, LogIn, Plus, History } from "lucide-react";
import { BotMessageSquare } from "@/components/animate-ui/icons/bot-message-square";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Button } from "@/components/ui/button";
import { ChatHistoryPanel } from "@/components/chat/chat-history-panel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from '@/contexts/i18n-context';
import type { UIMessage } from "ai";

const ChatInterface = ({
    initialMessages,
    conversationId,
    model,
}: {
    initialMessages: UIMessage[];
    conversationId: string | null;
    model: string;
}) => {
    const transport = useMemo(
        () =>
            new AssistantChatTransport({
                api: "/api/chat",
                body: {
                    model: model,
                    conversationId: conversationId,
                },
            }),
        [model, conversationId]
    );

    // Pass messages directly to useChatRuntime via the 'messages' property from ChatInit
    const runtime = useChatRuntime({
        transport,
        messages: initialMessages.length > 0 ? initialMessages : undefined,
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <Thread />
        </AssistantRuntimeProvider>
    );
};


export default function ChatPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const { t } = useI18n();
    const queryClient = useQueryClient();

    // Default model is hardcoded since selector is removed
    const selectedModel = "moonshotai/kimi-k2-instruct-0905";

    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

    // Fetch conversations using React Query with periodic refresh
    const { data: conversations = [] } = useQuery<any[]>({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const res = await fetch("/api/conversations");
            if (!res.ok) throw new Error("Failed to fetch conversations");
            const data = await res.json();
            return data.conversations || [];
        },
        enabled: !!user,
        staleTime: 10 * 1000, // 10 seconds
        refetchInterval: 15 * 1000, // Refresh every 15 seconds to pick up new conversations
        refetchOnWindowFocus: false,
    });

    // Fetch conversation history when ID changes
    useEffect(() => {
        if (!currentConversationId || !user) {
            setInitialMessages([]);
            return;
        }

        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const res = await fetch(`/api/conversations/${currentConversationId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    const messagesWithDates = (data.messages || []).map((msg: any) => ({
                        ...msg,
                        createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
                    }));
                    setInitialMessages(messagesWithDates);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
                setInitialMessages([]);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [currentConversationId, user]);

    const handleNewChat = useCallback(() => {
        setCurrentConversationId(null);
        setInitialMessages([]);
    }, []);

    const handleDeleteConversation = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (currentConversationId === id) {
                    handleNewChat();
                }
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    }, [currentConversationId, queryClient, handleNewChat]);

    // Auth loading state
    if (authLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Not logged in - show login prompt
    if (!user) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <AnimateIcon animateOnHover>
                        <BotMessageSquare className="h-16 w-16 text-primary" />
                    </AnimateIcon>
                    <h1 className="text-2xl font-bold">Bro Chat</h1>
                    <p className="text-center text-muted-foreground max-w-md" suppressHydrationWarning>
                        {t('chat.subtitle')}
                    </p>
                    <Button onClick={() => router.push("/login")} size="lg">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span suppressHydrationWarning>{t('auth.pleaseLogin')}</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden relative">

            <div className="relative z-10 flex h-full flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between px-4 py-2 max-w-3xl mx-auto">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Bro Chat</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleNewChat}
                                title={t('chat.newChat')}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setIsHistoryPanelOpen(true)}
                                title={t('nav.history')}
                            >
                                <History className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Thread component */}
                <div className="flex-1 overflow-hidden relative">
                    {isHistoryLoading ? (
                        <div className="flex-1 flex flex-col px-4 pt-4 pb-20 max-w-3xl mx-auto w-full">
                            {/* Skeleton messages */}
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Assistant message skeleton */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
                                    </div>
                                </div>

                                {/* User message skeleton */}
                                <div className="flex justify-end">
                                    <div className="bg-muted rounded-2xl px-4 py-3 max-w-[70%] space-y-2 animate-pulse">
                                        <div className="h-4 bg-background/50 rounded w-32" />
                                    </div>
                                </div>

                                {/* Assistant message skeleton */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded-lg w-full animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-4/5 animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-3/5 animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
                                    </div>
                                </div>

                                {/* User message skeleton */}
                                <div className="flex justify-end">
                                    <div className="bg-muted rounded-2xl px-4 py-3 max-w-[70%] space-y-2 animate-pulse">
                                        <div className="h-4 bg-background/50 rounded w-48" />
                                        <div className="h-4 bg-background/50 rounded w-24" />
                                    </div>
                                </div>

                                {/* Assistant message skeleton */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
                                        <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Loading indicator */}
                            <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm" suppressHydrationWarning>{t('common.loading')}</span>
                            </div>
                        </div>
                    ) : (
                        <ChatInterface
                            key={currentConversationId || 'new'}
                            initialMessages={initialMessages}
                            conversationId={currentConversationId}
                            model={selectedModel}
                        />
                    )}
                </div>

                {/* History Panel */}
                <ChatHistoryPanel
                    open={isHistoryPanelOpen}
                    onOpenChange={setIsHistoryPanelOpen}
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelect={(id) => {
                        setInitialMessages([]);
                        setIsHistoryLoading(true);
                        setCurrentConversationId(id);
                        setIsHistoryPanelOpen(false);
                    }}
                    onDelete={handleDeleteConversation}
                />
            </div>
        </div>
    );
}
