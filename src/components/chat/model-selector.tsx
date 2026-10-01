"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaretDown, Gauge, Globe, Lightning, Crown, Buildings, MagnifyingGlass, Check, Robot, Cpu, Brain, Flame, Lock, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ModelInfo = {
    id?: string;
    name: string;
    tier: string;
    provider: string;
    contextWindow?: number;
};

type ModelSelectorProps<T extends string> = {
    models: Record<T, ModelInfo>;
    selectedModel: T;
    onModelChange: (model: T) => void;
};

const tierConfig: Record<string, { icon: React.ReactNode; description: string; requiresUpgrade: boolean }> = {
    Economy: {
        icon: <Lightning size={16} />,
        description: "Fast & affordable",
        requiresUpgrade: false,
    },
    Standard: {
        icon: <Gauge size={16} />,
        description: "Balanced performance",
        requiresUpgrade: false,
    },
    Premium: {
        icon: <Crown size={16} />,
        description: "Requires Premium tier",
        requiresUpgrade: true,
    },
    Enterprise: {
        icon: <Buildings size={16} />,
        description: "Requires Enterprise tier",
        requiresUpgrade: true,
    },
};

const providerConfig: Record<string, { icon: React.ReactNode }> = {
    OpenAI: { icon: <Brain size={14} /> },
    Anthropic: { icon: <Robot size={14} /> },
    Google: { icon: <Globe size={14} /> },
    Mistral: { icon: <Flame size={14} /> },
    "Open Source": { icon: <Cpu size={14} /> },
    Other: { icon: <Cpu size={14} /> },
};

const tiers = ["Economy", "Standard", "Premium", "Enterprise"] as const;

export function ModelSelector<T extends string>({
    models,
    selectedModel,
    onModelChange,
}: ModelSelectorProps<T>) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedTier, setSelectedTier] = useState<string>("all");

    const currentModel = models[selectedModel];
    const currentTier = currentModel?.tier || "Economy";

    // Convert models object to array for easier manipulation
    const modelsArray = useMemo(() => {
        return (Object.entries(models) as [T, ModelInfo][]).map(([id, info]) => ({
            ...info,
            id,
        }));
    }, [models]);

    // Filter models based on search and tier
    const filteredModels = useMemo(() => {
        return modelsArray.filter((model) => {
            const matchesSearch =
                model.name.toLowerCase().includes(search.toLowerCase()) ||
                model.provider.toLowerCase().includes(search.toLowerCase()) ||
                model.id.toLowerCase().includes(search.toLowerCase());
            const matchesTier = selectedTier === "all" || model.tier === selectedTier;
            return matchesSearch && matchesTier;
        });
    }, [modelsArray, search, selectedTier]);

    // Group filtered models by tier
    const modelsByTier = useMemo(() => {
        return tiers.reduce((acc, tier) => {
            acc[tier] = filteredModels.filter((m) => m.tier === tier);
            return acc;
        }, {} as Record<string, typeof filteredModels>);
    }, [filteredModels]);

    // Count models per tier
    const tierCounts = useMemo(() => {
        return tiers.reduce((acc, tier) => {
            acc[tier] = modelsArray.filter((m) => m.tier === tier).length;
            return acc;
        }, {} as Record<string, number>);
    }, [modelsArray]);

    const handleSelect = (modelId: T) => {
        onModelChange(modelId);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 pl-3 pr-2"
                >
                    <span className="flex items-center gap-1.5 text-ink-muted">
                        {tierConfig[currentTier]?.icon}
                    </span>
                    <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                        {currentModel?.name || "Select Model"}
                    </span>
                    <span className="sm:hidden font-medium">
                        {currentModel?.provider || "Model"}
                    </span>
                    <CaretDown size={16} className="shrink-0 text-ink-faint" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <DialogTitle className="font-heading text-xl font-semibold flex items-center gap-2">
                        <Robot size={20} className="text-ai" />
                        Choose AI Model
                    </DialogTitle>
                    <p className="text-sm text-ink-muted mt-1">
                        Select the AI model that best fits your needs
                    </p>
                </DialogHeader>

                <div className="px-6 py-4 border-b border-border">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <Input
                            placeholder={t("chat.modelSelector.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Tier filter chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {(["all", ...tiers] as const).map((tier) => {
                            const active = selectedTier === tier;
                            const count = tier === "all" ? modelsArray.length : tierCounts[tier];
                            return (
                                <button
                                    key={tier}
                                    type="button"
                                    aria-pressed={active}
                                    disabled={count === 0}
                                    onClick={() => setSelectedTier(tier)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors duration-150 disabled:opacity-50",
                                        active
                                            ? "border-transparent bg-primary font-semibold text-white"
                                            : "border-border text-ink-secondary hover:bg-surface-hover"
                                    )}
                                >
                                    {tier === "all" ? "All" : tier}
                                    <span className="tabular-nums opacity-70">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Models List */}
                <ScrollArea className="max-h-[400px]">
                    <div className="p-4">
                        {filteredModels.length === 0 ? (
                            <div className="text-center py-8 text-ink-muted">
                                <MagnifyingGlass size={32} className="mx-auto mb-2 text-ink-faint" />
                                <p>{t("chat.modelSelector.noResults")}</p>
                                <p className="text-sm">{t("chat.modelSelector.noResultsHint")}</p>
                            </div>
                        ) : selectedTier === "all" ? (
                            // Grouped by tier view
                            <div className="space-y-6">
                                {tiers.map((tier) => {
                                    const tierModels = modelsByTier[tier];
                                    if (tierModels.length === 0) return null;

                                    return (
                                        <div key={tier}>
                                            <div className="mb-3 flex items-center gap-2 border-b border-border px-1 pb-2">
                                                <span className="text-ink-muted">
                                                    {tierConfig[tier].icon}
                                                </span>
                                                <span className="text-sm font-semibold text-ink">
                                                    {tier}
                                                </span>
                                                <span className="text-xs text-ink-muted">
                                                    • {tierConfig[tier].description}
                                                </span>
                                                <Badge variant="secondary" className="ml-auto text-xs">
                                                    {tierModels.length}
                                                </Badge>
                                            </div>
                                            <div className="grid gap-2">
                                                {tierModels.map((model) => (
                                                    <ModelCard
                                                        key={model.id}
                                                        model={model}
                                                        isSelected={model.id === selectedModel}
                                                        onSelect={() => handleSelect(model.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Flat list for filtered tier
                            <div className="grid gap-2">
                                {filteredModels.map((model) => (
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        isSelected={model.id === selectedModel}
                                        onSelect={() => handleSelect(model.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-ink-muted">
                        {filteredModels.length} models available
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                        <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">↑↓</kbd>
                        <span>Navigate</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">Enter</kbd>
                        <span>Select</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Separate ModelCard component for cleaner code
function ModelCard({
    model,
    isSelected,
    onSelect,
}: {
    model: { id: string; name: string; tier: string; provider: string; contextWindow?: number };
    isSelected: boolean;
    onSelect: () => void;
}) {
    const provider = providerConfig[model.provider] || providerConfig.Other;
    const tier = tierConfig[model.tier] || tierConfig.Economy;
    const requiresUpgrade = tier.requiresUpgrade;

    const cardContent = (
        <button
            onClick={onSelect}
            className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-surface text-left transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                requiresUpgrade
                    ? "opacity-70 hover:opacity-90 cursor-pointer"
                    : "hover:bg-surface-hover",
                isSelected
                    ? "border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]"
                    : "border-border"
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Provider Icon */}
                    <div
                        className={cn(
                            "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                            "bg-surface-raised text-ink-secondary"
                        )}
                    >
                        {provider.icon}
                    </div>

                    {/* Model Info */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{model.name}</span>
                            {isSelected && (
                                <Check size={16} className="text-brand shrink-0" />
                            )}
                            {requiresUpgrade && (
                                <Lock size={12} className="text-ink-muted shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-ink-secondary">
                                {model.provider}
                            </span>
                            <span className="text-ink-muted text-[10px]">•</span>
                            <span className="text-xs text-ink-muted truncate">
                                {model.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tier Badge */}
                <Badge variant="secondary" className="h-5 shrink-0 gap-1 px-1.5 py-0 text-[10px]">
                    {tier.icon}
                    {requiresUpgrade && <Lock size={10} />}
                </Badge>
            </div>
        </button>
    );

    if (requiresUpgrade) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {cardContent}
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                        <div className="flex items-center gap-2">
                            <WarningCircle size={16} className="text-warning shrink-0" />
                            <span className="text-sm">
                                {tier.description}. You can still select it, but API may return an error.
                            </span>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return cardContent;
}
