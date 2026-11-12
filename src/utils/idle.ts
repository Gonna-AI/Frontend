type IdleCallbackHandle = number;
type IdleCallback = IdleRequestCallback;

export function runWhenIdle(callback: IdleCallback, timeout = 3000) {
  if (typeof window === 'undefined') {
    return 0;
  }

  // Safari has no requestIdleCallback: the typings say it always exists, the browser says otherwise.
  if (typeof (window as Partial<Window>).requestIdleCallback === 'function') {
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

  if (typeof (window as Partial<Window>).cancelIdleCallback === 'function') {
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
