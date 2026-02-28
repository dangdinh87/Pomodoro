"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useAuthStore } from "@/stores/auth-store";
import { useSystemStore } from "@/stores/system-store";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Plus } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import type { UIMessage } from "ai";
import { BotMessageSquare } from "@/components/animate-ui/icons/bot-message-square";
import { cn } from "@/lib/utils";
import { ConversationSelector } from "@/components/chat/conversation-selector";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_CHAT_AI_MODEL } from "@/config/constants";

// ... (imports remain the same)

const GlobalChatInterface = ({
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

export function GlobalChat() {
	const pathname = usePathname();
	const { user } = useAuthStore();
	const { isChatPanelOpen, setChatPanelOpen } = useSystemStore();
	const { t } = useI18n();
	const queryClient = useQueryClient();

	// State for chat
	const [isNewThread, setIsNewThread] = useState(true);
	const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
	const [chatKey, setChatKey] = useState(() => `new-${Date.now()}`);

	// Use centralized model constant
	const selectedModel = DEFAULT_CHAT_AI_MODEL;

	// Fetch conversations
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
		staleTime: 10 * 1000,
		refetchInterval: 15 * 1000,
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

	// Sync history data to initialMessages
	const initialMessages = historyData || [];

	const handleNewChat = useCallback(() => {
		setIsNewThread(true);
		setCurrentConversationId(null);
		setChatKey(`new-${Date.now()}`);
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

	const handleDeleteConversation = async (id: string) => {
		try {
			const res = await fetch(`/api/conversations/${id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				if (currentConversationId === id) {
					handleNewChat();
				}
				queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
			document.body.style.cursor = "default";
		};

		if (isResizing) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "ew-resize";
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
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
						onSelect={(id: string) => {
							if (id === currentConversationId) return;
							setCurrentConversationId(id);
							setChatKey(`conv-${id}`);
							setIsNewThread(false);
						}}
						onNewChat={handleNewChat}
						onDelete={handleDeleteConversation}
					/>
				</div>
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatPanelOpen(false)} aria-label="Close chat">
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-hidden bg-background/50 relative">
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
								</div>
							</div>
						</div>
					</div>
				) : (
					<GlobalChatInterface
						key={chatKey}
						initialMessages={initialMessages}
						conversationId={currentConversationId}
						model={selectedModel}
						onConversationCreated={handleConversationCreated}
					/>
				)}
			</div>
		</div>
	);
}
