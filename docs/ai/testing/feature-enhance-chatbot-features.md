---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- Unit test coverage: 100% of new tool executor functions
- Integration test scope: Chat API → Tool Execution → Database roundtrip
- End-to-end test scenarios: Key user journeys (create task, update task, get stats)
- Alignment with requirements: Each user story has corresponding test case

## Unit Tests

**What individual components need testing?**

### Tool Definitions (`tool-definitions.ts`)

- [ ] All tools have valid JSON schema
- [ ] Required fields properly marked
- [ ] Enum values match database constraints

### Tool Executor (`tool-executor.ts`)

- [ ] `create_task` creates task with correct fields
- [ ] `create_task` handles missing optional fields
- [ ] `update_task` finds task by partial name match
- [ ] `update_task` handles multiple matches (returns options)
- [ ] `update_task` handles no matches (error message)
- [ ] `search_tasks` returns filtered results
- [ ] `search_tasks` respects status/priority filters
- [ ] `get_stats` returns correct date range data
- [ ] `get_sessions` returns session history

### Response Formatter (`response-formatter.ts`)

- [ ] Task creation success message includes task title
- [ ] Task update success message describes changes
- [ ] Stats response formats time human-readable
- [ ] Error messages are user-friendly (Vietnamese)

### Fuzzy Task Matching

- [ ] Exact title match returns single result
- [ ] Partial match returns candidates
- [ ] Case-insensitive matching works
- [ ] Vietnamese diacritics handled correctly

## Integration Tests

**How do we test component interactions?**

- [ ] Chat API receives message → calls LLM → executes tool → returns response
- [ ] Tool execution uses correct user ID from session
- [ ] Database changes persist correctly
- [ ] Streaming response includes tool results
- [ ] Error in tool execution returns graceful error in stream

### API Endpoint Tests

- [ ] POST `/api/chat` with task creation intent → task created in DB
- [ ] POST `/api/chat` with task update intent → task updated in DB
- [ ] POST `/api/chat` with stats query → returns correct stats

## End-to-End Tests

**What user flows need validation?**

### Task Creation Flow

- [ ] User: "Create a task called 'Study math' with high priority"
- [ ] Expected: Task created, confirmation message shown
- [ ] Verify: Task appears in tasks list

### Task Update Flow

- [ ] User: "Mark the math task as done"
- [ ] Expected: Task status updated to DONE
- [ ] Verify: Task status changed in database

### Task Search Flow

- [ ] User: "Show me my high priority tasks"
- [ ] Expected: List of high priority tasks returned
- [ ] Verify: Only HIGH priority tasks in response

### Stats Query Flow

- [ ] User: "How many Pomodoros did I complete today?"
- [ ] Expected: Count of today's work sessions
- [ ] Verify: Count matches database records

### Vietnamese Language Flow

- [ ] User: "Tạo task 'Đọc sách' với độ ưu tiên cao"
- [ ] Expected: Task created with Vietnamese title
- [ ] Response: In Vietnamese

### Error Handling Flow

- [ ] User: "Update task 'nonexistent' to done"
- [ ] Expected: Error message saying task not found
- [ ] Verify: No database changes

## Test Data

**What data do we use for testing?**

### Test Fixtures

```typescript
const testTasks = [
  { title: "Study math", priority: "HIGH", status: "TODO" },
  { title: "Read chapter 5", priority: "MEDIUM", status: "DOING" },
  { title: "Review notes", priority: "LOW", status: "DONE" },
];

const testSessions = [
  { mode: "work", duration: 1500, created_at: "today" },
  { mode: "shortBreak", duration: 300, created_at: "today" },
];
```

### Test Database Setup

- Use separate test user in Supabase
- Seed data before tests, clean up after
- Consider using Supabase test project or mocked client

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands

```bash
pnpm test -- --coverage
```

### Coverage Targets

- `src/lib/chat-tools/`: 100%
- `src/app/api/chat/route.ts` (new code): 100%

### Manual Testing Sign-off

- [ ] Developer tested locally
- [ ] Tested in both English and Vietnamese
- [ ] Tested with authenticated user
- [ ] Tested error scenarios

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

- [ ] Chat responses feel natural and conversational
- [ ] Confirmation messages are clear
- [ ] Error messages are helpful (not technical)
- [ ] Response time feels acceptable
- [ ] Emoji usage is appropriate

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Smoke Tests After Deployment

- [ ] Can create task via chat
- [ ] Can update task via chat
- [ ] Can query stats via chat
- [ ] Chat still works for general conversation

## Performance Testing

**How do we validate performance?**

### Response Time Benchmarks

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Task creation | < 2s | < 3s |
| Task update | < 2s | < 3s |
| Task search | < 1.5s | < 2.5s |
| Stats query | < 2s | < 3s |

### Load Testing (if needed)

- Not critical for initial release
- Consider if feature gains high usage

## Bug Tracking

**How do we manage issues?**

### Issue Labels

- `bug/chatbot-tools`: Issues with tool execution
- `bug/chatbot-nlu`: Issues with intent detection
- `enhancement/chatbot`: Feature improvements

### Severity Levels

- **Critical**: Tool execution corrupts data
- **High**: Common operations fail
- **Medium**: Edge cases not handled
- **Low**: Response wording improvements
