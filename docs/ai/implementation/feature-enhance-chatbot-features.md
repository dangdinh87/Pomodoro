---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 18+ and pnpm installed
- Access to MegaLLM API key (already configured in `.env`)
- Supabase project configured (already set up)

### Environment Setup

No additional environment variables needed; uses existing:

- `MEGALLM_API_KEY`: API key for MegaLLM
- Supabase credentials already configured

## Code Structure

**How is the code organized?**

### New Files to Create

```
src/
├── lib/
│   └── chat-tools/
│       ├── index.ts              # Export all modules
│       ├── tool-definitions.ts   # Tool schemas for LLM
│       ├── tool-executor.ts      # Execute tool calls
│       └── response-formatter.ts # Format results as natural language
```

### Files to Modify

```
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          # Add tool calling logic
├── lib/
│   └── prompts/
│       └── bro-ai-system.ts      # Update system prompt
```

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: Tool Definitions

```typescript
// src/lib/chat-tools/tool-definitions.ts
export const CHAT_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new Pomodoro task for the user",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          estimate_pomodoros: { type: "number", description: "Estimated pomodoros" },
          tags: { type: "array", items: { type: "string" } }
        },
        required: ["title"]
      }
    }
  },
  // ... other tools
];
```

#### Feature 2: Tool Execution Pattern

```typescript
// src/lib/chat-tools/tool-executor.ts
export async function executeToolCall(
  toolName: string,
  args: Record<string, any>,
  supabase: SupabaseClient,
  userId: string
): Promise<ToolResult> {
  switch (toolName) {
    case "create_task":
      return await createTaskTool(args, supabase, userId);
    case "update_task":
      return await updateTaskTool(args, supabase, userId);
    // ... other cases
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
```

#### Feature 3: Fuzzy Task Matching

```typescript
// For update_task, search by partial title match
async function findTaskByName(
  query: string,
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("tasks")
    .select("id, title")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .ilike("title", `%${query}%`)
    .limit(5);
  
  return data;
}
```

### Patterns & Best Practices

#### Pattern 1: Streaming with Tool Calls

When the LLM decides to call a tool:

1. Parse the tool call from the stream
2. Execute the tool
3. Send tool result back to LLM for final response
4. Stream the final response to client

#### Pattern 2: Error Handling in Tools

```typescript
// Always return structured results
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string; // User-friendly message
}
```

#### Pattern 3: Vietnamese/English Support

The system prompt should instruct the LLM to:

- Accept commands in both languages
- Respond in the user's language
- Parse intent regardless of language

## Integration Points

**How do pieces connect?**

### Internal API Calls

Tools call existing API logic directly (not HTTP requests):

```typescript
// Instead of fetch('/api/tasks', ...), import handler logic
import { validateCreateTask, buildInsertPayload } from '@/app/api/tasks/task-schemas';
```

### Response Flow

1. User message → Chat API
2. Chat API → LLM with tools
3. LLM → Tool call (if needed)
4. Tool execution → Internal API
5. Result → LLM for formatting
6. LLM response → Stream to user

## Error Handling

**How do we handle failures?**

### Strategy

1. **Tool Execution Errors**: Catch and return user-friendly message
2. **Database Errors**: Log internally, return generic error to user
3. **LLM Errors**: Fall back to non-tool response
4. **Validation Errors**: Return specific field errors

### Example Error Response

```typescript
// If task not found for update
return {
  success: false,
  message: "Không tìm thấy task với tên đó. Bạn có thể nói rõ hơn không? 🤔"
};
```

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

1. **Limit Query Results**: Cap task searches at 10 results
2. **Parallel Execution**: If multiple independent tools, execute in parallel
3. **Cache User Info**: User ID already available, no extra auth call

### Avoid

- Fetching all user tasks for simple operations
- Multiple round-trips to LLM when one suffices
- Large context windows with full task lists

## Security Notes

**What security measures are in place?**

### Authentication

- All tool operations require authenticated user (existing auth check)
- User ID from session used for all database queries

### Input Validation

- Tool parameters validated before execution
- Use existing validation schemas from `task-schemas.ts`

### Data Access

- RLS (Row Level Security) already enforces user isolation in Supabase
- Additional `user_id` checks in tool executor as defense-in-depth
