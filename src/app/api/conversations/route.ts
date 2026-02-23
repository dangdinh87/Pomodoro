import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { DEFAULT_CHAT_AI_MODEL, ALLOWED_CHAT_MODELS } from "@/config/constants";

export async function GET() {
	const supabase = await createClient();

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: conversations, error } = await supabase
			.from("conversations")
			.select("id, title, model, created_at, updated_at")
			.eq("user_id", user.id)
			.order("updated_at", { ascending: false });

		if (error) {
			console.error("[Conversations API] Error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ conversations });
	} catch (error) {
		console.error("[Conversations API] Error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

const ADJECTIVES = [
	"Focused",
	"Deep",
	"Creative",
	"Strategic",
	"Productive",
	"Mindful",
	"Efficient",
	"Dynamic",
	"Structured",
	"Inspired",
	"Clear",
	"Intentional",
	"Active",
	"Brilliant",
	"Smart",
];

const NOUNS = [
	"Session",
	"Sprint",
	"Flow",
	"Work",
	"Planning",
	"Brainstorm",
	"Thinking",
	"Study",
	"Focus",
	"Ideas",
	"Strategy",
	"Analysis",
	"Review",
	"Development",
	"Progress",
];

function generateRandomTitle(): string {
	const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
	return `${adj} ${noun}`;
}

export async function POST(req: Request) {
	const supabase = await createClient();

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { title, model } = body;

		if (model && !ALLOWED_CHAT_MODELS.includes(model)) {
			return NextResponse.json({ error: "Invalid model" }, { status: 400 });
		}

		// Generate a random productivity-themed title if none is provided
		const finalTitle = title || generateRandomTitle();

		const { data: conversation, error } = await supabase
			.from("conversations")
			.insert({
				user_id: user.id,
				title: finalTitle,
				model: model || DEFAULT_CHAT_AI_MODEL,
			})
			.select()
			.single();

		if (error) {
			console.error("[Conversations API] Error creating:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ conversation }, { status: 201 });
	} catch (error) {
		console.error("[Conversations API] Error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
