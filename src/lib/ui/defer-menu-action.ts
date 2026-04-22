/**
 * Defers a callback to the next tick.
 *
 * Use inside `DropdownMenuItem` `onClick` handlers when the action
 * opens a Dialog / AlertDialog / Sheet. Without the defer, Radix UI
 * closes the menu *after* the dialog mounts, leaving
 * `pointer-events: none` stuck on `<body>` and freezing the page.
 *
 * @example
 * <DropdownMenuItem onClick={() => deferMenuAction(() => onEdit(item))}>
 */
export function deferMenuAction(fn: () => void): void {
  window.setTimeout(fn, 0);
}
