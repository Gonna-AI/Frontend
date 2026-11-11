/**
 * Imported before the Amplitude SDK (see amplitudeSdk.ts) on purpose: the SDK keeps references to
 * fetch / sendBeacon / XMLHttpRequest when it is first evaluated, so the guard has to wrap them first.
 */
import { hasConsent } from './consent';

const AMPLITUDE_HOST = /(^|\.)amplitude\.com$/;

function isAmplitudeUrl(input: RequestInfo | URL | string | undefined): boolean {
  try {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input && 'url' in input ? input.url : '';
    return AMPLITUDE_HOST.test(new URL(raw, window.location.href).hostname);
  } catch {
    return false;
  }
}

/**
 * Last line of defence for withdrawn consent. setOptOut() stops new events, but events the SDK
 * had already queued (and its retries) would still be sent on its next flush. While there is no
 * consent, nothing may leave for Amplitude at all, whatever the SDK has buffered.
 */
function installConsentGuard() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) =>
    isAmplitudeUrl(input) && !hasConsent('analytics')
      ? Promise.reject(new TypeError('Blocked: analytics consent withdrawn'))
      : nativeFetch(input, init);

  const nativeBeacon = navigator.sendBeacon?.bind(navigator);
  if (nativeBeacon) {
    navigator.sendBeacon = (url, data) => (isAmplitudeUrl(String(url)) && !hasConsent('analytics') ? false : nativeBeacon(url, data));
  }

  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
    if (isAmplitudeUrl(url) && !hasConsent('analytics')) throw new DOMException('Blocked: analytics consent withdrawn', 'NetworkError');
    return (nativeOpen as (...args: unknown[]) => void).call(this, method, url, ...rest);
  } as typeof XMLHttpRequest.prototype.open;
}

installConsentGuard();
