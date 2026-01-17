"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
    useChatRuntime,
    AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useAuthStore } from "@/stores/auth-store";
import { useSystemStore } from "@/stores/system-store";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Plus } from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';
import type { UIMessage } from "ai";
import { BotMessageSquare } from "@/components/animate-ui/icons/bot-message-square";
import { cn } from "@/lib/utils";
import { ConversationSelector } from "@/components/chat/conversation-selector";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ... (imports remain the same)

const GlobalChatInterface = ({
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

export function GlobalChat() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { isChatPanelOpen, setChatPanelOpen } = useSystemStore();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    
    // State for chat
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

    // Hardcoded model for now
    const selectedModel = "moonshotai/kimi-k2-instruct-0905";

    // Fetch conversations
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
        staleTime: 10 * 1000,
        refetchInterval: 15 * 1000,
        refetchOnWindowFocus: false,
    });

    // Fetch conversation history when ID changes
    useEffect(() => {
        if (!currentConversationId || !user) {
            setInitialMessages([]);
            return;
        }

        const fetchHistory = async () => {
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
            }
        };

        fetchHistory();
    }, [currentConversationId, user]);

    // Load last conversation when opening (optional, skipping for now to keep simple)
    useEffect(() => {
        if (isChatPanelOpen && user && !currentConversationId) {
            // Logic to auto-select last conversation could go here
        }
    }, [isChatPanelOpen, user, currentConversationId]);

    const handleNewChat = () => {
        setCurrentConversationId(null);
        setInitialMessages([]);
    };

    const handleDeleteConversation = async (id: string) => {
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
    };

    // State for panel width
    const [panelWidth, setPanelWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);

    // Resizing logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            const maxWidth = window.innerWidth * 0.5; // Max 50%
            const minWidth = 300; // Min width

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Hide on /chat page to avoid duplication
    if (pathname === "/chat") return null;
    
    // Don't show if not logged in
    if (!user) return null;

    return (
        <div
            className={cn(
                "border-l bg-background flex flex-col shrink-0 h-full transition-transform duration-300 ease-in-out relative",
                isChatPanelOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full border-l-0"
            )}
            style={{ width: isChatPanelOpen ? panelWidth : 0 }}
        >
            {/* Drag Handle */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-50"
                onMouseDown={() => setIsResizing(true)}
            />

            <div className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0 shrink-0 h-14">
                <div className="flex items-center gap-2">
                   <ConversationSelector
                        conversations={conversations}
                        currentConversationId={currentConversationId}
                        onSelect={setCurrentConversationId}
                        onNewChat={handleNewChat}
                        onDelete={handleDeleteConversation}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setChatPanelOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-background/50 relative">
                <GlobalChatInterface
                    key={currentConversationId || 'new'}
                    initialMessages={initialMessages}
                    conversationId={currentConversationId}
                    model={selectedModel}
                />
            </div>
        </div>
    );
}
