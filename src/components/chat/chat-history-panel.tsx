"use client";

import * as React from "react";
import { MessageSquare, Trash2, Search, MoreHorizontal, Plus } from "lucide-react";
import { isToday, isYesterday, isWithinInterval, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface ChatHistoryPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
}

type TimeGroup = 'today' | 'yesterday' | 'last7Days' | 'older';

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

export function ChatHistoryPanel({
    open,
    onOpenChange,
    conversations,
    currentConversationId,
    onSelect,
    onNewChat,
    onDelete,
}: ChatHistoryPanelProps) {
    const { t } = useI18n();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [conversationToDelete, setConversationToDelete] = React.useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter conversations by search query
    const filteredConversations = React.useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const query = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.title?.toLowerCase().includes(query)
        );
    }, [conversations, searchQuery]);

    const groupedConversations = React.useMemo(() =>
        groupConversationsByTime(filteredConversations),
        [filteredConversations]
    );

    const timeGroupLabels: Record<TimeGroup, string> = {
        today: t('history.dateRange.today'),
        yesterday: t('history.dateRange.yesterday'),
        last7Days: t('history.dateRange.last7Days'),
        older: t('chat.conversationGroups.older'),
    };

    const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        // Don't allow deleting the currently selected conversation
        if (currentConversationId === conversation.id) return;
        setConversationToDelete(conversation);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (conversationToDelete) {
            onDelete(conversationToDelete.id);
        }
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
    };

    const renderConversationItem = (conversation: Conversation) => (
        <div
            key={conversation.id}
            className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
                currentConversationId === conversation.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
            )}
        >
            <div
                className="flex-1 min-w-0"
                onClick={() => {
                    onSelect(conversation.id);
                    onOpenChange(false);
                }}
            >
                <span className={cn(
                    "block truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]",
                    currentConversationId === conversation.id && "font-medium"
                )}>
                    {conversation.title || t('chat.newChat')}
                </span>
            </div>

            {/* Hide delete button for currently selected conversation */}
            {currentConversationId !== conversation.id && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 min-w-[28px] shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(conversation, e);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );

    const renderGroup = (group: TimeGroup, conversations: Conversation[]) => {
        if (conversations.length === 0) return null;
        return (
            <div key={group} className="mb-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {timeGroupLabels[group]}
                </div>
                <div className="space-y-0.5">
                    {conversations.map((conv) => renderConversationItem(conv))}
                </div>
            </div>
        );
    };

    const hasConversations = filteredConversations.length > 0;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-72 sm:w-80 p-0">
                    <SheetHeader className="px-3 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-base">
                                {t('chat.historyTitle')}
                            </SheetTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary"
                                onClick={() => {
                                    onNewChat();
                                    onOpenChange(false);
                                }}
                                title={t('chat.newChat')}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* Search Input */}
                    <div className="px-2 py-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder={t('common.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-sm"
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[calc(100vh-120px)]">
                        {!hasConversations ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in-50 duration-300">
                                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? t('common.noResults') : t('chat.noConversations')}
                                </p>
                            </div>
                        ) : (
                            <div className="p-1.5">
                                {renderGroup('today', groupedConversations.today)}
                                {renderGroup('yesterday', groupedConversations.yesterday)}
                                {renderGroup('last7Days', groupedConversations.last7Days)}
                                {renderGroup('older', groupedConversations.older)}
                            </div>
                        )}
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('chat.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('chat.deleteConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

