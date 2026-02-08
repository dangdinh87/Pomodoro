"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MessageSquare, Plus, Trash2, MoreHorizontal, Search } from "lucide-react";
import { isToday, isYesterday, isWithinInterval, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/contexts/i18n-context";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
	id: string;
	title: string | null;
	updated_at: string;
}

interface ConversationSelectorProps {
	conversations: Conversation[];
	currentConversationId: string | null;
	onSelect: (id: string) => void;
	onNewChat: () => void;
	onDelete: (id: string) => void;
}

type TimeGroup = "today" | "yesterday" | "last7Days" | "older";

interface GroupedConversations {
	today: Conversation[];
	yesterday: Conversation[];
	last7Days: Conversation[];
	older: Conversation[];
}

function groupConversationsByTime(conversations: Conversation[]): GroupedConversations {
	const now = new Date();
	const sevenDaysAgo = startOfDay(subDays(now, 7));

	const groups: GroupedConversations = {
		today: [],
		yesterday: [],
		last7Days: [],
		older: [],
	};

	conversations.forEach((conversation) => {
		const updatedAt = new Date(conversation.updated_at);

		if (isToday(updatedAt)) {
			groups.today.push(conversation);
		} else if (isYesterday(updatedAt)) {
			groups.yesterday.push(conversation);
		} else if (isWithinInterval(updatedAt, { start: sevenDaysAgo, end: now })) {
			groups.last7Days.push(conversation);
		} else {
			groups.older.push(conversation);
		}
	});

	return groups;
}

export function ConversationSelector({
	conversations,
	currentConversationId,
	onSelect,
	onNewChat,
	onDelete,
}: ConversationSelectorProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const { t } = useI18n();

	const selectedConversation = conversations.find((c) => c.id === currentConversationId);

	const filteredConversations = conversations.filter((c) =>
		(c.title || t("chat.newChat")).toLowerCase().includes(searchQuery.toLowerCase())
	);

	const groupedConversations = React.useMemo(
		() => groupConversationsByTime(filteredConversations),
		[filteredConversations]
	);

	const timeGroupLabels: Record<TimeGroup, string> = {
		today: t("history.dateRange.today"),
		yesterday: t("history.dateRange.yesterday"),
		last7Days: t("history.dateRange.last7Days"),
		older: t("chat.conversationGroups.older"),
	};

	const renderConversationItem = (conversation: Conversation) => (
		<div
			key={conversation.id}
			className="group flex items-center gap-1 rounded-sm px-2 hover:bg-accent text-sm py-1.5 focus-within:bg-accent relative"
		>
			<div
				className="flex-1 flex items-center gap-2 cursor-pointer truncate min-w-0"
				onClick={() => {
					onSelect(conversation.id);
					setOpen(false);
				}}
			>
				<MessageSquare
					className={cn(
						"h-4 w-4 shrink-0",
						currentConversationId === conversation.id ? "text-primary" : "text-muted-foreground"
					)}
				/>
				<span className={cn("truncate flex-1", currentConversationId === conversation.id && "font-medium")}>
					{conversation.title || t("chat.newChat")}
				</span>
				{currentConversationId === conversation.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100"
					>
						<MoreHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(conversation.id);
						}}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{t("common.delete")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);

	const renderGroup = (group: TimeGroup, conversations: Conversation[]) => {
		if (conversations.length === 0) return null;
		return (
			<div key={group} className="py-1">
				<div className="px-2 py-1 text-xs font-medium text-muted-foreground">{timeGroupLabels[group]}</div>
				{conversations.map(renderConversationItem)}
			</div>
		);
	};

	const hasConversations = filteredConversations.length > 0;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[280px] justify-between bg-muted/50 hover:bg-muted border-0 h-9"
				>
					<div className="flex items-center gap-2 truncate">
						<MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
						<span className="truncate">{selectedConversation?.title || t("chat.newChat")}</span>
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[280px] p-0" align="start">
				<div className="p-2">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("common.search")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 h-9"
						/>
					</div>
				</div>
				<div
					className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer text-primary"
					onClick={() => {
						onNewChat();
						setOpen(false);
					}}
				>
					<Plus className="h-4 w-4" />
					<span className="font-medium text-sm">{t("chat.newChat")}</span>
				</div>
				<ScrollArea className="h-[300px]">
					{!hasConversations ? (
						<div className="p-4 text-center text-sm text-muted-foreground">{t("errors.notFound")}</div>
					) : (
						<div className="p-1">
							{renderGroup("today", groupedConversations.today)}
							{renderGroup("yesterday", groupedConversations.yesterday)}
							{renderGroup("last7Days", groupedConversations.last7Days)}
							{renderGroup("older", groupedConversations.older)}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
