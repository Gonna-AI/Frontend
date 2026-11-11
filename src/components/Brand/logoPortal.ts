

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SESSION_KEY = 'ct-logo-portal';

/** True until the intro has played once in this browser session. */
export function shouldPlayFirstVisitIntro() {
  if (prefersReducedMotion()) return false;
  try {
    return !window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}
