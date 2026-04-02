'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function getSnapshot(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

function getServerSnapshot(): string {
  return '/';
}

/**
 * Returns the current pathname, reactively updating on popstate events.
 * For router integration, pass `currentPath` directly instead.
 */
export function useCurrentPath(currentPath?: string): string {
  const locationPath = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return currentPath ?? locationPath;
}
