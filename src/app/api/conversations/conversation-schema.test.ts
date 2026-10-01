import { DEFAULT_CHAT_AI_MODEL } from '@/config/constants';
import {
  CONVERSATION_TITLE_MAX_LENGTH,
  validateConversationInput,
} from './conversation-schema';

describe('validateConversationInput', () => {
  it('accepts a trimmed title and a whitelisted model', () => {
    expect(validateConversationInput({ title: '  Exam prep ', model: DEFAULT_CHAT_AI_MODEL })).toEqual({
      success: true,
      data: { title: 'Exam prep', model: DEFAULT_CHAT_AI_MODEL },
    });
  });

  it('treats missing/empty fields as not provided', () => {
    expect(validateConversationInput({})).toEqual({ success: true, data: {} });
    expect(validateConversationInput({ title: '', model: null })).toEqual({ success: true, data: {} });
  });

  it.each([
    [{ model: 'gpt-expensive-unlisted' }],
    [{ title: 42 }],
    [{ title: '   ' }],
    [{ title: 'x'.repeat(CONVERSATION_TITLE_MAX_LENGTH + 1) }],
    [[]],
    [null],
  ])('rejects %p', (body) => {
    expect(validateConversationInput(body).success).toBe(false);
  });
});
