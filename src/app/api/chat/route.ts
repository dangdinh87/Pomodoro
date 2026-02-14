import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { createClient } from "@/lib/supabase-server";
import { BRO_AI_SYSTEM_PROMPT } from "@/lib/prompts/bro-ai-system";
import { ALLOWED_CHAT_MODELS, DEFAULT_CHAT_AI_MODEL } from "@/config/constants";

export const maxDuration = 60;

// Convert assistant-ui message format to OpenAI format
function convertMessages(messages: any[]) {
	return messages.map((msg) => {
		// If already has content string, return as-is
		if (typeof msg.content === "string") {
			return { role: msg.role, content: msg.content };
		}

		// If has parts array (assistant-ui format), extract text
		if (Array.isArray(msg.parts)) {
			const textParts = msg.parts
				.filter((p: any) => p.type === "text")
				.map((p: any) => p.text)
				.join("\n");
			return { role: msg.role, content: textParts };
		}

		// Fallback
		return { role: msg.role, content: msg.content || "" };
	});
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
						role: "user",
						content: `Generate a short, concise title (max 10 words) for a new chatbot conversation in a Pomodoro app with a playful & friendly vibe, with the same language as user language. Return ONLY the title, no quotes, no punctuation at the end. User's first message: "${userMessage}"`,
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
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (!user || authError) {
		return new Response("Unauthorized", { status: 401 });
	}

	let { messages, model = DEFAULT_CHAT_AI_MODEL, conversationId } = await req.json();

	// Validate model against whitelist
	if (!ALLOWED_CHAT_MODELS.includes(model)) {
		model = DEFAULT_CHAT_AI_MODEL;
	}

	if (!Array.isArray(messages)) {
		return new Response("Invalid messages format", { status: 400 });
	}

	console.log("[Chat API] Received:", {
		model,
		messagesCount: messages?.length,
		conversationId,
		userId: user.id,
	});

	// Create conversation if it doesn't exist
	let conversationTitle = "";
	let isNewConversation = false;
	if (user && !conversationId) {
		// Extract text from the first user message
		const firstUserMsg = messages.find((m: any) => m.role === "user");
		let titleContent = "";

		if (firstUserMsg) {
			if (typeof firstUserMsg.content === "string") {
				titleContent = firstUserMsg.content;
			} else if (Array.isArray(firstUserMsg.parts)) {
				titleContent = firstUserMsg.parts
					.filter((p: any) => p.type === "text")
					.map((p: any) => p.text)
					.join(" ");
			}
		}

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

	// Convert messages to OpenAI format
	const convertedMessages = convertMessages(messages);

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
							stream: true,
						}),
					});

					if (!response.ok) {
						const errorText = await response.text();
						console.error("[Chat API] MegaLLM error:", response.status, errorText);

						let errorMessage = `Error ${response.status}: `;
						try {
							const errorJson = JSON.parse(errorText);
							errorMessage += errorJson.error?.message || errorText;
						} catch {
							errorMessage += errorText;
						}

						writer.write({ type: "start", messageId });
						writer.write({ type: "start-step" });
						writer.write({
							type: "error",
							errorText: errorMessage,
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
							.eq("id", conversationId);
					}
				} catch (error) {
					console.error("[Chat API] Error:", error);
					writer.write({
						type: "error",
						errorText: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		}),
	});
}
