import { openPanel } from './panel-store';

/**
 * Skipping lives inside TimerControls: it asks first while running and records the partial session.
 * The command menu presses that same button instead of duplicating the rules. Returns whether it was found.
 */
export function pressSkipButton(label: string): boolean {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
    (el) => el.getAttribute('aria-label') === label && !el.disabled,
  );
  button?.click();
  return Boolean(button);
}

/** Runs `focus` once `find` returns an element (a lazy panel mounts a moment after it opens), then gives up. */
function focusWhenMounted(find: () => HTMLElement | null, timeoutMs = 3000) {
  let done = false;
  const finish = () => {
    done = true;
    observer.disconnect();
    clearTimeout(giveUp);
  };
  const attempt = () => {
    const el = find();
    if (!el || done) return;
    finish();
    // The dialog moves focus to its first control when it opens; focus the field after that.
    setTimeout(() => el.focus(), 60);
  };
  const observer = new MutationObserver(attempt);
  const giveUp = setTimeout(finish, timeoutMs);
  observer.observe(document.body, { childList: true, subtree: true });
  attempt();
}

/** Opens the Tasks panel with the cursor already in its quick-add field. */
export function openTaskQuickAdd(fieldLabel: string) {
  openPanel('tasks');
  focusWhenMounted(
    () => Array.from(document.querySelectorAll<HTMLElement>('input')).find((el) => el.getAttribute('aria-label') === fieldLabel) ?? null,
  );
}
