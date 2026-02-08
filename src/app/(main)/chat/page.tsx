"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, LogIn, Plus, History } from "lucide-react";
import { BotMessageSquare } from "@/components/animate-ui/icons/bot-message-square";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Button } from "@/components/ui/button";
import { ChatHistoryPanel } from "@/components/chat/chat-history-panel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/contexts/i18n-context";
import type { UIMessage } from "ai";
import { DEFAULT_CHAT_AI_MODEL } from "@/config/constants";

const ChatInterface = ({
	initialMessages,
	conversationId,
	model,
	onConversationCreated,
}: {
	initialMessages: UIMessage[];
	conversationId: string | null;
	model: string;
	onConversationCreated?: (id: string, title: string) => void;
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
		onData: (dataPart) => {
			// Handle conversation metadata from stream (type is 'data-conversation')
			if (dataPart.type === "data-conversation") {
				const data = dataPart.data as { conversationId?: string; conversationTitle?: string };
				if (data.conversationId && data.conversationTitle && onConversationCreated) {
					onConversationCreated(data.conversationId, data.conversationTitle);
				}
			}
		},
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

	// Use centralized model constant
	const selectedModel = DEFAULT_CHAT_AI_MODEL;

	const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
	const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
	const [chatKey, setChatKey] = useState(() => `new-${Date.now()}`);
	const [isNewThread, setIsNewThread] = useState(true);

	// Fetch conversations using React Query with periodic refresh
	const { data: conversations = [] } = useQuery<any[]>({
		queryKey: ["conversations", user?.id],
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

	// Fetch conversation history using React Query with caching
	const { data: historyData, isLoading: isHistoryLoading } = useQuery<UIMessage[]>({
		queryKey: ["conversationHistory", currentConversationId],
		queryFn: async () => {
			if (!currentConversationId || !user) return [];
			const res = await fetch(`/api/conversations/${currentConversationId}/messages`);
			if (!res.ok) return [];
			const data = await res.json();
			return (data.messages || []).map((msg: any) => ({
				...msg,
				createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
			}));
		},
		enabled: !!currentConversationId && !!user && !isNewThread,
		staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch if data is less than 5 min old
		refetchOnWindowFocus: false, // Don't refetch on window focus
		refetchOnMount: false, // Don't refetch if data is cached
	});

	// Sync history data to initialMessages state
	const initialMessages = historyData || [];

	const handleNewChat = useCallback(() => {
		setCurrentConversationId(null);
		setChatKey(`new-${Date.now()}`);
		setIsNewThread(true);
	}, []);

	// Handle new conversation created from stream
	const handleConversationCreated = useCallback(
		(id: string, title: string) => {
			setCurrentConversationId(id);
			// Don't update chatKey here — keep the component mounted to preserve streaming
			// Optimistically add the new conversation to the list
			queryClient.setQueryData(["conversations", user?.id], (old: any[] = []) => {
				// Only add if not already present
				if (old.some((c) => c.id === id)) return old;
				return [{ id, title, updated_at: new Date().toISOString() }, ...old];
			});
			// Also invalidate to ensure fresh data from server
			queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
		},
		[queryClient, user?.id]
	);

	const handleDeleteConversation = useCallback(
		async (id: string) => {
			try {
				const res = await fetch(`/api/conversations/${id}`, {
					method: "DELETE",
				});
				if (res.ok) {
					if (currentConversationId === id) {
						handleNewChat();
					}
					queryClient.invalidateQueries({
						queryKey: ["conversations"],
					});
				}
			} catch (error) {
				console.error("Failed to delete conversation:", error);
			}
		},
		[currentConversationId, queryClient, handleNewChat]
	);

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
						{t("chat.subtitle")}
					</p>
					<Button onClick={() => router.push("/login")} size="lg">
						<LogIn className="mr-2 h-4 w-4" />
						<span suppressHydrationWarning>{t("auth.pleaseLogin")}</span>
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
								title={t("chat.newChat")}
							>
								<Plus className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9"
								onClick={() => setIsHistoryPanelOpen(true)}
								title={t("nav.history")}
							>
								<History className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>

				{/* Thread component */}
				<div className="flex-1 overflow-hidden relative">
					{isHistoryLoading && !isNewThread ? (
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
									<span
										className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									/>
									<span
										className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}
									/>
									<span
										className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
										style={{ animationDelay: "300ms" }}
									/>
								</div>
								<span className="text-sm" suppressHydrationWarning>
									{t("common.loading")}
								</span>
							</div>
						</div>
					) : (
						<ChatInterface
							key={chatKey}
							initialMessages={initialMessages}
							conversationId={currentConversationId}
							model={selectedModel}
							onConversationCreated={handleConversationCreated}
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
						if (id === currentConversationId) return;
						setCurrentConversationId(id);
						setChatKey(`conv-${id}`);
						setIsNewThread(false);
						setIsHistoryPanelOpen(false);
					}}
					onNewChat={handleNewChat}
					onDelete={handleDeleteConversation}
				/>
			</div>
		</div>
	);
}
