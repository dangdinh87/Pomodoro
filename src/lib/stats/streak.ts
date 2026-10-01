const DAY_MS = 24 * 60 * 60 * 1000;

const dayNumber = (isoDay: string) => Math.round(Date.parse(`${isoDay}T00:00:00Z`) / DAY_MS);

/**
 * Current and longest run of consecutive active days. `activeDays` are
 * YYYY-MM-DD strings (any order, duplicates allowed). The current streak stays
 * alive through `today` until the day is over, so it counts if the last active
 * day is today or yesterday.
 */
export function computeStreaks(activeDays: string[], today: string) {
  const days = Array.from(new Set(activeDays.map(dayNumber))).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const last = days[days.length - 1];
  const current = last !== undefined && dayNumber(today) - last <= 1 ? run : 0;
  return { current, longest };
}
