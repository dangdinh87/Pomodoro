"use client";

import { useState, useEffect } from "react";

export type ModelCapabilities = {
    supports_function_calling?: boolean;
    supports_vision?: boolean;
    supports_streaming?: boolean;
    supports_structured_output?: boolean;
};

export type ModelPricing = {
    input_tokens_cost_per_million?: number;
    output_tokens_cost_per_million?: number;
    currency?: string;
};

export type ModelInfo = {
    id: string;
    name: string;
    tier: string;
    provider: string;
    contextWindow?: number;
    maxOutputTokens?: number;
    capabilities?: ModelCapabilities;
    pricing?: ModelPricing;
};

type UseModelsReturn = {
    models: ModelInfo[];
    modelsMap: Record<string, ModelInfo>;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

// Default fallback models in case API fails
const FALLBACK_MODELS: ModelInfo[] = [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", tier: "Economy", provider: "OpenAI" },
    { id: "gemini-2.0-flash-001", name: "Gemini 2.0 Flash", tier: "Economy", provider: "Google" },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", tier: "Standard", provider: "Anthropic" },
];

export function useMegaLLMModels(): UseModelsReturn {
    const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/chat/models");

            if (!response.ok) {
                throw new Error("Failed to fetch models");
            }

            const data = await response.json();

            if (data.models && data.models.length > 0) {
                setModels(data.models);
            }
        } catch (err) {
            console.error("Error fetching models:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch models");
            // Keep fallback models on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const modelsMap = models.reduce((acc, model) => {
        acc[model.id] = model;
        return acc;
    }, {} as Record<string, ModelInfo>);

    return {
        models,
        modelsMap,
        isLoading,
        error,
        refetch: fetchModels,
    };
}
