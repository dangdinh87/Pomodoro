/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

jest.mock('ai', () => ({
  createUIMessageStream: jest.fn(),
  createUIMessageStreamResponse: jest.fn(() => new Response('mock-stream')),
}));

jest.mock('@/lib/prompts/bro-ai-system', () => ({
  BRO_AI_SYSTEM_PROMPT: 'mock-system-prompt',
}));

describe('Chat API', () => {
  let mockSupabase: any;
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    mockRequest = {
      json: jest.fn(),
    };
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mockRequest.json.mockResolvedValue({ messages: [] });

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 403 if message insertion fails (unauthorized conversation)', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockRequest.json.mockResolvedValue({
      messages: [{ role: 'user', content: 'hello' }],
      conversationId: 'conv-456', // Simulated foreign conversation ID
    });

    // Mock successful fetch of conversation/messages check
    const mockQueryBuilder = {
      insert: jest.fn().mockReturnValue({
        error: { message: 'RLS violation' }, // Simulate failure
      }),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'conv-456' }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };
    mockSupabase.from.mockReturnValue(mockQueryBuilder);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(403);
    expect(mockQueryBuilder.insert).toHaveBeenCalled(); // Ensure insertion was attempted
  });
});
