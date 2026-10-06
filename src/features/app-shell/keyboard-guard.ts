/** Global single-key shortcuts must not fire while typing or while a dialog/sheet owns the keyboard. */
export function shouldIgnoreShortcut(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  // event.target can be the Document itself (e.g. a keydown that fires right after the focused element
  // was removed from the DOM, so focus reverts to document before the next element claims it) — Document
  // has no getAttribute, so this guards against that instead of assuming every target is an Element.
  const target = event.target instanceof Element ? (event.target as HTMLElement) : null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable ||
      target.getAttribute('role') === 'textbox')
  ) {
    return true;
  }
  return Boolean(document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'));
}
