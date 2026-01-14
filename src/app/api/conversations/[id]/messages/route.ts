import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
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
            return NextResponse.json({ error: error.message }, { status: 500 });
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

        const body = await req.json();
        const { role, content } = body;

        if (!role || !content) {
            return NextResponse.json(
                { error: "role and content are required" },
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
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update conversation's updated_at
        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("[Messages API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
