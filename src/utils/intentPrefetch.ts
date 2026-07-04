import { isSaveDataEnabled, runWhenIdle } from './idle';

type Prefetcher = () => Promise<unknown>;

const prefetched = new Set<string>();

function normalizePath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }
    return url.pathname;
  } catch {
    return null;
  }
}

function findPrefetcher(pathname: string, routes: Record<string, Prefetcher>) {
  if (routes[pathname]) {
    return routes[pathname];
  }

  if (pathname.startsWith('/blog/') && routes['/blog/:slug']) {
    return routes['/blog/:slug'];
  }

  if (pathname.startsWith('/research/') && routes['/research/:topicSlug']) {
    return routes['/research/:topicSlug'];
  }

  if (pathname.startsWith('/dashboard/') && routes['/dashboard']) {
    return routes['/dashboard'];
  }

  return null;
}

function prefetchPath(pathname: string, routes: Record<string, Prefetcher>) {
  if (prefetched.has(pathname) || isSaveDataEnabled()) {
    return;
  }

  const prefetcher = findPrefetcher(pathname, routes);
  if (!prefetcher) {
    return;
  }

  prefetched.add(pathname);
  runWhenIdle(() => {
    prefetcher().catch(() => {
      prefetched.delete(pathname);
    });
  }, 1500);
}

function getAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>('a[href]');
}

export function installIntentPrefetch(routes: Record<string, Prefetcher>) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleIntent = (event: Event) => {
    const anchor = getAnchor(event.target);
    if (!anchor) {
      return;
    }

    const pathname = normalizePath(anchor.href);
    if (!pathname) {
      return;
    }

    prefetchPath(pathname, routes);
  };

  document.addEventListener('pointerover', handleIntent, { capture: true, passive: true });
  document.addEventListener('focusin', handleIntent, { capture: true });
  document.addEventListener('touchstart', handleIntent, { capture: true, passive: true });

  return () => {
    document.removeEventListener('pointerover', handleIntent, { capture: true });
    document.removeEventListener('focusin', handleIntent, { capture: true });
    document.removeEventListener('touchstart', handleIntent, { capture: true });
  };
}
