/**
 * The Amplitude SDK, isolated in its own module so the bundler emits it as a
 * separate chunk that is only fetched after the visitor opts in to analytics.
 * Analytics and session replay only: no experiment or in-app messaging
 * plugins, which would pull further third-party scripts at runtime.
 */
import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

export async function start(apiKey: string) {
  await amplitude.add(sessionReplayPlugin({ sampleRate: 1 })).promise;
  await amplitude.init(apiKey, undefined, { serverZone: 'EU', autocapture: true }).promise;
}

export function track(name: string, properties: Record<string, unknown>) {
  amplitude.track(name, properties);
}

/** Stops collection and forgets this browser's identifiers. */
export function stop() {
  amplitude.setOptOut(true);
  amplitude.reset();
}

export function resume() {
  amplitude.setOptOut(false);
}
