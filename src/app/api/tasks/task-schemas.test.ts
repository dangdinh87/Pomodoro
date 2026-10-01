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
      parent_task_id: VALID_UUID,
      due_date: '2026-10-05',
    });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        title: 'Read chapter 3',
        parent_task_id: VALID_UUID,
        due_date: '2026-10-05',
        priority: 'MEDIUM',
      }),
    });
  });

  it('rejects malformed parent_task_id and due_date', () => {
    const result = validateCreateTask({
      title: 'x',
      parent_task_id: 'abc',
      due_date: 'not a date',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toEqual({
        parent_task_id: ['Parent task id is invalid'],
        due_date: ['Due date is invalid'],
      });
    }
  });

  it('treats empty parent/due values as null', () => {
    const result = validateCreateTask({ title: 'x', parent_task_id: '', due_date: null });
    expect(result.success && result.data.parent_task_id).toBeNull();
    expect(result.success && result.data.due_date).toBeNull();
  });

  it('rejects non-string titles without throwing', () => {
    expect(validateCreateTask({ title: 123 }).success).toBe(false);
  });
});

describe('validateUpdateTask', () => {
  it('accepts clearing the parent task', () => {
    expect(validateUpdateTask({ parent_task_id: null })).toEqual({
      success: true,
      data: { parent_task_id: null },
    });
  });

  it('rejects an invalid parent task id', () => {
    const result = validateUpdateTask({ parent_task_id: 'x' });
    expect(result.success).toBe(false);
  });
});
