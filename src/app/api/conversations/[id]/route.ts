import { featureGate } from '@/config/feature-gate';
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { validateConversationInput } from "../conversation-schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const gated = featureGate('chat');
  if (gated) return gated;

    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get conversation
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id, title, model, created_at, updated_at")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (convError || !conversation) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Get messages
        const { data: messages, error: msgError } = await supabase
            .from("messages")
            .select("id, role, content, created_at")
            .eq("conversation_id", id)
            .order("created_at", { ascending: true });

        if (msgError) {
            console.error("[Conversation API] Error getting messages:", msgError);
            return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
        }

        return NextResponse.json({ conversation, messages });
    } catch (error) {
        console.error("[Conversation API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request, { params }: Params) {
  const gated = featureGate('chat');
  if (gated) return gated;

    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
        }

        const parsed = validateConversationInput(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const updates = parsed.data;
        if (!Object.keys(updates).length) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        const { data: conversation, error } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("[Conversation API] Error updating:", error);
            return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error("[Conversation API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: Params) {
  const gated = featureGate('chat');
  if (gated) return gated;

    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("conversations")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("[Conversation API] Error deleting:", error);
            return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Conversation API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
