import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
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
            return NextResponse.json({ error: msgError.message }, { status: 500 });
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
    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, model } = body;

        const updates: Record<string, string> = {};
        if (title !== undefined) updates.title = title;
        if (model !== undefined) updates.model = model;

        const { data: conversation, error } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("[Conversation API] Error updating:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
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
            return NextResponse.json({ error: error.message }, { status: 500 });
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
