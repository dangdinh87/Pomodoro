import { ALLOWED_CHAT_MODELS } from "@/config/constants";

export const CONVERSATION_TITLE_MAX_LENGTH = 200;
// Persisted chat messages (assistant replies can be long); ~5x the upstream input cap
export const STORED_MESSAGE_MAX_LENGTH = 20_000;

export interface ConversationUpdates {
	title?: string;
	model?: string;
}

type ValidationResult =
	| { success: true; data: ConversationUpdates }
	| { success: false; error: string };

/**
 * Validates the user-editable conversation fields. Only whitelisted models are
 * accepted so a stored `model` can never be used to bypass the chat whitelist.
 */
export function validateConversationInput(body: unknown): ValidationResult {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return { success: false, error: "Request body must be an object" };
	}

	const { title, model } = body as Record<string, unknown>;
	const data: ConversationUpdates = {};

	if (title !== undefined && title !== null && title !== "") {
		if (typeof title !== "string" || !title.trim()) {
			return { success: false, error: "Title must be a non-empty string" };
		}
		if (title.trim().length > CONVERSATION_TITLE_MAX_LENGTH) {
			return {
				success: false,
				error: `Title must be at most ${CONVERSATION_TITLE_MAX_LENGTH} characters`,
			};
		}
		data.title = title.trim();
	}

	if (model !== undefined && model !== null && model !== "") {
		if (typeof model !== "string" || !ALLOWED_CHAT_MODELS.includes(model)) {
			return { success: false, error: "Model is not allowed" };
		}
		data.model = model;
	}

	return { success: true, data };
}
