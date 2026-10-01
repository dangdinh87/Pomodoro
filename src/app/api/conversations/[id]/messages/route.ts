import { featureGate } from '@/config/feature-gate';
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { STORED_MESSAGE_MAX_LENGTH } from "../../conversation-schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const gated = featureGate('chat');
  if (gated) return gated;

    const supabase = await createClient();
    const { id: conversationId } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership and fetch messages
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (convError || !conversation) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const { data: messages, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("[Messages API] Error fetching:", error);
            return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
        }

        // Map to UI-compatible format with 'parts' array structure
        // UIMessage expects: { id, role, parts: [{ type: 'text', text: '...' }], createdAt }
        const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            parts: [{ type: 'text', text: msg.content || '' }],
            createdAt: msg.created_at ? new Date(msg.created_at) : undefined,
        }));

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("[Messages API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


export async function POST(req: Request, { params }: Params) {
  const gated = featureGate('chat');
  if (gated) return gated;

    const supabase = await createClient();
    const { id: conversationId } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (convError || !conversation) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
        }
        const { role, content } = body ?? {};

        if (!role || typeof content !== "string" || !content.trim()) {
            return NextResponse.json(
                { error: "role and content are required" },
                { status: 400 }
            );
        }

        if (content.length > STORED_MESSAGE_MAX_LENGTH) {
            return NextResponse.json(
                { error: `content must be at most ${STORED_MESSAGE_MAX_LENGTH} characters` },
                { status: 400 }
            );
        }

        if (role !== "user" && role !== "assistant") {
            return NextResponse.json(
                { error: "Invalid role. Only 'user' or 'assistant' are allowed." },
                { status: 400 }
            );
        }

        const { data: message, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                role,
                content,
            })
            .select()
            .single();

        if (error) {
            console.error("[Messages API] Error creating:", error);
            return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
        }

        // Update conversation's updated_at
        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId)
            .eq("user_id", user.id);

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("[Messages API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
