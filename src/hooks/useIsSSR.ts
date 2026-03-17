'use client';

import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return false;
}

function getServerSnapshot() {
  return true;
}

/**
 * Returns true during SSR, false after hydration.
 * Useful for rendering different content on server vs client.
 */
export function useIsSSR(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns true after hydration is complete.
 */
export function useHydrated(): boolean {
  return !useIsSSR();
}
