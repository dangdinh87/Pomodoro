import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Type for MegaLLM model response (based on official API docs)
export type MegaLLMModel = {
    id: string;
    object: string;
    owned_by: string;
    display_name?: string;
    created_at?: string;
    capabilities?: {
        supports_function_calling?: boolean;
        supports_vision?: boolean;
        supports_streaming?: boolean;
        supports_structured_output?: boolean;
    };
    pricing?: {
        input_tokens_cost_per_million?: number;
        output_tokens_cost_per_million?: number;
        currency?: string;
    };
    context_length?: number;
    max_output_tokens?: number;
};

export type MegaLLMModelsResponse = {
    object: string;
    data: MegaLLMModel[];
};

// Tier mapping based on model pricing or name
function getModelTier(model: MegaLLMModel): string {
    const id = model.id.toLowerCase();

    // Enterprise tier
    if (id.includes("opus") || id.includes("4.1") || id.includes("o1-pro")) {
        return "Enterprise";
    }

    // Premium tier
    if (id.includes("gpt-5") && !id.includes("mini") ||
        id.includes("sonnet-4") ||
        id.includes("2.5-pro") ||
        id.includes("o1") ||
        id.includes("o3")) {
        return "Premium";
    }

    // Standard tier
    if (id.includes("gpt-5-mini") ||
        id.includes("claude-3.5") ||
        id.includes("gemini-1.5-pro")) {
        return "Standard";
    }

    // Default to Economy
    return "Economy";
}

// Get provider from model id
function getProvider(modelId: string): string {
    const id = modelId.toLowerCase();
    if (id.includes("gpt") || id.includes("o1") || id.includes("o3") || id.includes("dall-e") || id.includes("whisper") || id.includes("tts")) {
        return "OpenAI";
    }
    if (id.includes("claude")) {
        return "Anthropic";
    }
    if (id.includes("gemini")) {
        return "Google";
    }
    if (id.includes("mistral") || id.includes("codestral")) {
        return "Mistral";
    }
    if (id.includes("llama") || id.includes("deepseek") || id.includes("qwen")) {
        return "Open Source";
    }
    return "Other";
}

// Format model name for display
function formatModelName(modelId: string): string {
    // Common formatting rules
    return modelId
        .split("-")
        .map(part => {
            // Keep version numbers as-is
            if (/^\d/.test(part) || /^v\d/.test(part)) {
                return part;
            }
            // Capitalize first letter
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(" ")
        .replace(/(\d)\.(\d)/g, "$1.$2") // Keep decimal versions
        .replace(/Gpt/g, "GPT")
        .replace(/Tts/g, "TTS")
        .replace(/Dall E/g, "DALL-E")
        .replace(/\s+/g, " ")
        .trim();
}

// Filter for text generation models only
function isTextModel(modelId: string): boolean {
    const id = modelId.toLowerCase();
    // Exclude non-text models
    if (id.includes("dall-e") ||
        id.includes("whisper") ||
        id.includes("tts") ||
        id.includes("embedding") ||
        id.includes("moderation") ||
        id.includes("image")) {
        return false;
    }
    return true;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const apiKey = process.env.MEGALLM_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "MegaLLM API key not configured" },
                { status: 500 }
            );
        }

        const response = await fetch("https://ai.megallm.io/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("MegaLLM API error:", response.status, errorText);
            return NextResponse.json(
                { error: "Failed to fetch models from MegaLLM" },
                { status: response.status }
            );
        }

        const data: MegaLLMModelsResponse = await response.json();

        // Transform and filter models
        const models = data.data
            .filter(model => isTextModel(model.id))
            .map(model => ({
                id: model.id,
                name: model.display_name || formatModelName(model.id),
                tier: getModelTier(model),
                provider: getProvider(model.id),
                contextWindow: model.context_length,
                maxOutputTokens: model.max_output_tokens,
                capabilities: model.capabilities,
                pricing: model.pricing,
            }))
            .sort((a, b) => {
                // Sort by tier priority, then by name
                const tierOrder = { Economy: 0, Standard: 1, Premium: 2, Enterprise: 3 };
                const tierDiff = tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
                if (tierDiff !== 0) return tierDiff;
                return a.name.localeCompare(b.name);
            });

        return NextResponse.json({ models });
    } catch (error) {
        console.error("Error fetching MegaLLM models:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
