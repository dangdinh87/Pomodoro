import { featureGate } from '@/config/feature-gate';
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";
import { BRO_AI_SYSTEM_PROMPT } from "@/lib/prompts/bro-ai-system";
import { getMessageText, toUpstreamMessages } from "@/lib/chat/chat-request-guards";
import { consumeRateLimit } from "@/lib/api/in-memory-rate-limiter";
import {
	DEFAULT_CHAT_AI_MODEL,
	ALLOWED_CHAT_MODELS,
	CHAT_MAX_MESSAGE_CHARS,
	CHAT_MAX_OUTPUT_TOKENS,
	CHAT_MAX_USER_MESSAGES_PER_HOUR,
} from "@/config/constants";

export const maxDuration = 60;

const ONE_HOUR_MS = 60 * 60 * 1000;
const UPSTREAM_ERROR_MESSAGE = "The AI service is unavailable right now. Please try again later.";
const GENERIC_ERROR_MESSAGE = "Something went wrong while generating a reply. Please try again.";

/**
 * Durable per-user quota: counts the user's own persisted messages in the last
 * hour (the count survives across serverless instances, unlike in-memory state).
 * Fails open on query errors — per-request caps still bound the cost.
 */
async function hasExceededHourlyQuota(supabase: SupabaseClient, userId: string) {
	const since = new Date(Date.now() - ONE_HOUR_MS).toISOString();
	const { count, error } = await supabase
		.from("messages")
		.select("id, conversations!inner(user_id)", { count: "exact", head: true })
		.eq("conversations.user_id", userId)
		.eq("role", "user")
		.gte("created_at", since);

	if (error) {
		console.error("[Chat API] Quota check failed:", error);
		return false;
	}
	return (count ?? 0) >= CHAT_MAX_USER_MESSAGES_PER_HOUR;
}

// Generate a conversation title using MegaLLM API
async function generateTitle(userMessage: string): Promise<string> {
	const fallbackTitle = userMessage.trim().substring(0, 50) || "New Chat";
	try {
		const response = await fetch("https://ai.megallm.io/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.MEGALLM_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: DEFAULT_CHAT_AI_MODEL,
				messages: [
					{
						role: "system",
						content: "Generate a short, concise title (max 10 words) for a new chatbot conversation in a Pomodoro app with a playful & friendly vibe, with the same language as user language. Return ONLY the title, no quotes, no punctuation at the end.",
					},
					{
						role: "user",
						content: userMessage,
					},
				],
				max_tokens: 20,
			}),
		});

		if (!response.ok) {
			console.error("[Chat API] Title generation failed:", response.status);
			return fallbackTitle;
		}

		const data = await response.json();
		const title = data.choices?.[0]?.message?.content?.trim();
		return title || fallbackTitle;
	} catch (error) {
		console.error("[Chat API] Title generation error:", error);
		return fallbackTitle;
	}
}

export async function POST(req: Request) {
  const gated = featureGate('chat');
  if (gated) return gated;

	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (!user || authError) {
		return new Response("Unauthorized", { status: 401 });
	}

	let body: any;
	try {
		body = await req.json();
	} catch {
		return new Response("Invalid JSON body", { status: 400 });
	}

	let { messages, model = DEFAULT_CHAT_AI_MODEL, conversationId } = body ?? {};

	// Validate model against whitelist
	if (!ALLOWED_CHAT_MODELS.includes(model)) {
		console.warn(`[Chat API] Invalid model requested: ${model}. Defaulting to ${DEFAULT_CHAT_AI_MODEL}`);
		model = DEFAULT_CHAT_AI_MODEL;
	}

	if (!Array.isArray(messages) || messages.length === 0) {
		return new Response("Invalid messages format", { status: 400 });
	}

	if (conversationId !== undefined && conversationId !== null && typeof conversationId !== "string") {
		return new Response("Invalid conversationId", { status: 400 });
	}

	// Convert messages to OpenAI format (role-sanitized, history and size capped)
	const convertedMessages = toUpstreamMessages(messages);

	// Every upstream call must be driven by a new user message: this is what the
	// quota counts, so assistant-only payloads would otherwise bypass it.
	if (convertedMessages[convertedMessages.length - 1]?.role !== "user") {
		return new Response("The last message must be a non-empty user message", { status: 400 });
	}

	console.log("[Chat API] Received:", {
		model,
		messagesCount: messages.length,
		conversationId,
		userId: user.id,
	});

	// Two layers: an in-memory burst limiter (catches concurrent requests the DB
	// count cannot see yet) and the persisted-message count (survives instances).
	// TODO(phase-02): a durable usage counter table — deleting a conversation
	// currently removes its messages from the persisted count.
	const burstLimit = consumeRateLimit(`chat:${user.id}`, CHAT_MAX_USER_MESSAGES_PER_HOUR, ONE_HOUR_MS);
	if (!burstLimit.allowed || (await hasExceededHourlyQuota(supabase, user.id))) {
		return new Response("Too many messages. Please try again later.", { status: 429 });
	}

	// An existing conversation must belong to the caller before we write into it
	if (conversationId) {
		const { data: ownedConversation, error: ownershipError } = await supabase
			.from("conversations")
			.select("id")
			.eq("id", conversationId)
			.eq("user_id", user.id)
			.maybeSingle();

		if (ownershipError || !ownedConversation) {
			return new Response("Conversation not found", { status: 404 });
		}
	}

	// Create conversation if it doesn't exist
	let conversationTitle = "";
	let isNewConversation = false;
	if (user && !conversationId) {
		// Extract text from the first user message
		const firstUserMsg = messages.find((m: any) => m?.role === "user");
		const titleContent = getMessageText(firstUserMsg, " ").slice(0, CHAT_MAX_MESSAGE_CHARS);

		// Generate title using MegaLLM API
		conversationTitle = await generateTitle(titleContent);

		const { data: newConv, error: createError } = await supabase
			.from("conversations")
			.insert({
				user_id: user.id,
				title: conversationTitle,
				model: model,
			})
			.select()
			.single();

		if (!createError && newConv) {
			conversationId = newConv.id;
			isNewConversation = true;
		} else {
			console.error("[Chat API] Failed to create conversation:", createError);
			// Proceed without ID (will fail persistence but maybe stream still works? prefer to fail gracefully)
		}
	}

	// Add system prompt to restrict AI to app-related topics only
	const systemPrompt = {
		role: "system",
		content: BRO_AI_SYSTEM_PROMPT,
	};

	// Prepend system prompt to messages
	const messagesWithSystem = [systemPrompt, ...convertedMessages];

	// If we have a conversationId and a user, save the last user message
	if (user && conversationId && messages.length > 0) {
		// Store USER message
		const lastUserMessage = convertedMessages.filter((m) => m.role === "user").pop();
		if (lastUserMessage) {
			await supabase.from("messages").insert({
				conversation_id: conversationId,
				role: "user",
				content: lastUserMessage.content,
			});
		}
	}

	// Generate unique message ID
	const messageId = `msg-${Date.now()}`;

	return createUIMessageStreamResponse({
		stream: createUIMessageStream({
			async execute({ writer }) {
				let fullAssistantContent = "";
				try {
					// Call MegaLLM API directly
					const response = await fetch("https://ai.megallm.io/v1/chat/completions", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${process.env.MEGALLM_API_KEY}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							model,
							messages: messagesWithSystem,
							max_tokens: CHAT_MAX_OUTPUT_TOKENS,
							stream: true,
						}),
					});

					if (!response.ok) {
						// Provider details stay in server logs; clients get a generic message
						const errorText = await response.text();
						console.error("[Chat API] MegaLLM error:", response.status, errorText);

						writer.write({ type: "start", messageId });
						writer.write({ type: "start-step" });
						writer.write({
							type: "error",
							errorText: UPSTREAM_ERROR_MESSAGE,
						});
						writer.write({ type: "finish-step" });
						writer.write({ type: "finish" });
						return;
					}

					const reader = response.body?.getReader();
					const decoder = new TextDecoder("utf-8");

					if (!reader) {
						writer.write({
							type: "error",
							errorText: "No response body",
						});
						return;
					}

					writer.write({ type: "start", messageId });
					writer.write({ type: "start-step" });

					// Emit conversation metadata for new conversations so frontend can update immediately
					if (isNewConversation && conversationId) {
						writer.write({
							type: "data-conversation",
							data: {
								conversationId: conversationId,
								conversationTitle: conversationTitle,
							},
						});
					}

					writer.write({ type: "text-start", id: messageId });

					// Buffer for incomplete lines split across chunks
					let lineBuffer = "";

					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							// Process any remaining buffered content
							if (lineBuffer.startsWith("data: ")) {
								const data = lineBuffer.slice(6);
								if (data !== "[DONE]") {
									try {
										const json = JSON.parse(data);
										const content = json.choices?.[0]?.delta?.content || "";
										if (content) {
											fullAssistantContent += content;
											writer.write({
												type: "text-delta",
												id: messageId,
												delta: content,
											});
										}
									} catch (e) {}
								}
							}
							break;
						}

						const chunk = decoder.decode(value, { stream: true });
						// Prepend any buffered content from previous chunk
						const fullChunk = lineBuffer + chunk;
						const lines = fullChunk.split("\n");

						// If chunk doesn't end with newline, last line is incomplete
						// Buffer it for next iteration
						if (!chunk.endsWith("\n")) {
							lineBuffer = lines.pop() || "";
						} else {
							lineBuffer = "";
						}

						for (const line of lines) {
							if (line.startsWith("data: ")) {
								const data = line.slice(6);
								if (data === "[DONE]") break;
								try {
									const json = JSON.parse(data);
									const content = json.choices?.[0]?.delta?.content || "";
									if (content) {
										fullAssistantContent += content;
										writer.write({
											type: "text-delta",
											id: messageId,
											delta: content,
										});
									}
								} catch (e) {}
							}
						}
					}

					writer.write({ type: "text-end", id: messageId });
					writer.write({ type: "finish-step" });
					writer.write({ type: "finish" });

					// Persistence: Save Assistant Message
					if (user && conversationId && fullAssistantContent) {
						await supabase.from("messages").insert({
							conversation_id: conversationId,
							role: "assistant",
							content: fullAssistantContent,
						});

						// Update conversation updated_at
						await supabase
							.from("conversations")
							.update({ updated_at: new Date().toISOString() })
							.eq("id", conversationId)
							.eq("user_id", user.id);
					}
				} catch (error) {
					console.error("[Chat API] Error:", error);
					writer.write({
						type: "error",
						errorText: GENERIC_ERROR_MESSAGE,
					});
				}
			},
		}),
	});
}
