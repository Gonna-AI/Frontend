type IdleCallbackHandle = number;

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleCallback = (deadline: IdleDeadlineLike) => void;

declare global {
  interface Window {
    requestIdleCallback?: (callback: IdleCallback, options?: { timeout?: number }) => IdleCallbackHandle;
    cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
  }
}

export function runWhenIdle(callback: IdleCallback, timeout = 3000) {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout });
  }

  return window.setTimeout(() => {
    const start = performance.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (performance.now() - start)),
    });
  }, 1);
}

export function cancelIdle(handle: IdleCallbackHandle) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
}

export function isSaveDataEnabled() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean };
  }).connection;

  return Boolean(connection?.saveData);
}

export function shouldAutoplayMedia() {
  if (typeof window === 'undefined') {
    return false;
  }

  return !isSaveDataEnabled() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function yieldToMain() {
  const scheduler = (globalThis as typeof globalThis & {
    scheduler?: { yield?: () => Promise<void> };
  }).scheduler;

  if (typeof scheduler?.yield === 'function') {
    await scheduler.yield();
    return;
  }

  await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}
