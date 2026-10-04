import {
  MAX_DISPLAY_ORDER,
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

describe('tag bounds', () => {
  const tagsOf = (count: number, length = 5) =>
    Array.from({ length: count }, (_, i) => String(i).padStart(length, 'x'));

  it('accepts up to 10 tags of up to 32 characters', () => {
    const ok = validateCreateTask({ title: 'x', tags: [...tagsOf(9), 'a'.repeat(32)] });
    expect(ok.success && ok.data.tags).toHaveLength(10);
  });

  it('rejects a tag longer than 32 characters with a 400-style detail', () => {
    for (const result of [
      validateCreateTask({ title: 'x', tags: ['a'.repeat(33)] }),
      validateUpdateTask({ tags: ['fine', 'b'.repeat(200)] }),
    ]) {
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.details?.tags).toEqual(['Each tag must be at most 32 characters']);
    }
  });

  it('rejects more than 10 distinct tags instead of silently dropping the rest', () => {
    for (const result of [validateCreateTask({ title: 'x', tags: tagsOf(11) }), validateUpdateTask({ tags: tagsOf(11) })]) {
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.details?.tags).toEqual(['At most 10 tags per task']);
    }
  });

  it('counts a tag once however often it is repeated, and ignores blanks', () => {
    const result = validateCreateTask({ title: 'x', tags: [...tagsOf(10), ...tagsOf(10), '', '   ', 7] });
    expect(result.success && result.data.tags).toHaveLength(10);
  });
});

describe('display_order bounds', () => {
  const orderResult = (display_order: unknown) => validateUpdateTask({ display_order });

  it('accepts 0 through the largest int4', () => {
    expect(orderResult(0)).toEqual({ success: true, data: { display_order: 0 } });
    expect(orderResult(MAX_DISPLAY_ORDER)).toEqual({ success: true, data: { display_order: 2147483647 } });
    expect(orderResult(2.6)).toEqual({ success: true, data: { display_order: 3 } });
  });

  it.each([-1, MAX_DISPLAY_ORDER + 1, 1e12, Infinity, NaN, '5', 'abc', null, {}])('rejects %j with a detail, not a database error', (value) => {
    const result = orderResult(value);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.details?.display_order).toBeDefined();
  });
});
