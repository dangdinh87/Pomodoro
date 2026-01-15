import { calculateCurrentStreak } from './streak-tracker'

describe('calculateCurrentStreak', () => {
  const today = '2023-10-10'

  it('returns 0 if today is not in history', () => {
    const history = ['2023-10-08', '2023-10-09']
    expect(calculateCurrentStreak(history, today)).toBe(0)
  })

  it('returns 1 if only today is in history', () => {
    const history = ['2023-10-08', '2023-10-10']
    expect(calculateCurrentStreak(history, today)).toBe(1)
  })

  it('returns correctly for a streak of 3', () => {
    const history = ['2023-10-08', '2023-10-09', '2023-10-10']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })

  it('returns correctly for a streak of 3 with gaps before', () => {
    const history = ['2023-10-01', '2023-10-08', '2023-10-09', '2023-10-10']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })

  it('handles unsorted history', () => {
    const history = ['2023-10-10', '2023-10-08', '2023-10-09']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })

  it('handles history with duplicates', () => {
    const history = ['2023-10-09', '2023-10-10', '2023-10-09']
    expect(calculateCurrentStreak(history, today)).toBe(2)
  })
})
