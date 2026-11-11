/**
 * A tab opened before a deploy still points at page files the new build replaced. Loading one of
 * them fails (or, in a browser that swallows the failure, produces an empty module), and the
 * remedy is always the same: reload once to pick up the current build.
 *
 * The reload is allowed again after a cooldown rather than once per session, so a long visit that
 * spans several deploys keeps healing, while a file that is really missing cannot cause a loop.
 */

const KEY = 'ct-build-reload-at';
const COOLDOWN_MS = 30_000;
let reloading = false;

const STALE_BUILD = new RegExp(
  [
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'Importing a module script failed',
    'Loading chunk',
    'Loading CSS chunk',
    'Unable to preload',
    'is not a valid JavaScript MIME type',
    // React.lazy handed an empty module (Safari / Chrome wording)
    '_result\\.default',
    "reading 'default'",
    "evaluating '[^']*\\.default'",
  ].join('|'),
  'i',
);

export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return STALE_BUILD.test(message);
}

/** Reloads to fetch the current build. True if a reload is under way (or was just started). */
export function reloadForNewBuild(): boolean {
  if (reloading) return true;
  try {
    const last = Number(window.sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) return false;
    window.sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false; // storage blocked: without a guard a reload could loop, so leave it to the visitor
  }
  reloading = true;
  window.location.reload();
  return true;
}
