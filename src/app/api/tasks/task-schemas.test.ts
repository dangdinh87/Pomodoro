import {
  isUuid,
  sanitizeSearchTerm,
  validateCreateTask,
  validateUpdateTask,
} from './task-schemas';

const VALID_UUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('isUuid', () => {
  it('accepts canonical UUIDs only', () => {
    expect(isUuid(VALID_UUID)).toBe(true);
    expect(isUuid(VALID_UUID.toUpperCase())).toBe(true);
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid(`${VALID_UUID},id.neq.x`)).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe('sanitizeSearchTerm', () => {
  it('strips PostgREST filter syntax characters', () => {
    expect(sanitizeSearchTerm('a),is_deleted.eq.true,(title')).toBe(
      'a  is_deleted.eq.true  title',
    );
    expect(sanitizeSearchTerm('say "hi" \\ there')).toBe('say  hi    there');
  });

  it('caps length and handles empty input', () => {
    expect(sanitizeSearchTerm('x'.repeat(500))).toHaveLength(100);
    expect(sanitizeSearchTerm(null)).toBe('');
    expect(sanitizeSearchTerm('  ,() ')).toBe('');
  });
});

describe('validateCreateTask', () => {
  it('normalizes a valid payload', () => {
    const result = validateCreateTask({
      title: '  Read chapter 3 ',
      due_date: '2026-10-05',
    });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        title: 'Read chapter 3',
        due_date: '2026-10-05',
        priority: 'MEDIUM',
      }),
    });
  });

  it('rejects a malformed due_date', () => {
    const result = validateCreateTask({ title: 'x', due_date: 'not a date' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toEqual({ due_date: ['Due date is invalid'] });
    }
  });

  it('treats an empty due date as null', () => {
    const result = validateCreateTask({ title: 'x', due_date: '' });
    expect(result.success && result.data.due_date).toBeNull();
  });

  it('rejects non-string titles without throwing', () => {
    expect(validateCreateTask({ title: 123 }).success).toBe(false);
  });
});

describe('validateUpdateTask', () => {
  it('accepts clearing the due date', () => {
    expect(validateUpdateTask({ due_date: null })).toEqual({
      success: true,
      data: { due_date: null },
    });
  });

  it('rejects an invalid due date', () => {
    expect(validateUpdateTask({ due_date: 'x' }).success).toBe(false);
  });
});
