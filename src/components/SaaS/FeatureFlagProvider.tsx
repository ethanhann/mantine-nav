'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

type WhenHidden = 'hide' | 'disable' | 'lock';

interface FeatureFlagContextValue {
  isEnabled: (flag: string) => boolean;
  hasEntitlement: (entitlement: string) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  isEnabled: () => true,
  hasEntitlement: () => true,
});

export interface NavFeatureFlagProviderProps {
  children: ReactNode;
  flags?: Record<string, boolean>;
  entitlements?: string[];
}

export function NavFeatureFlagProvider({
  children,
  flags = {},
  entitlements = [],
}: NavFeatureFlagProviderProps) {
  const entitlementSet = useMemo(() => new Set(entitlements), [entitlements]);

  const value = useMemo(
    () => ({
      isEnabled: (flag: string) => flags[flag] ?? true,
      hasEntitlement: (entitlement: string) => entitlementSet.has(entitlement),
    }),
    [flags, entitlementSet],
  );

  return (
    <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag() {
  return useContext(FeatureFlagContext);
}

export interface FeatureGateProps {
  flag?: string;
  entitlement?: string;
  whenHidden?: WhenHidden;
  lockMessage?: string;
  children: ReactNode;
}

export function FeatureGate({
  flag,
  entitlement,
  whenHidden = 'hide',
  lockMessage = 'Upgrade required',
  children,
}: FeatureGateProps) {
  const { isEnabled, hasEntitlement } = useFeatureFlag();

  const flagOk = !flag || isEnabled(flag);
  const entitlementOk = !entitlement || hasEntitlement(entitlement);
  const allowed = flagOk && entitlementOk;

  if (allowed) return <>{children}</>;

  if (whenHidden === 'hide') return null;

  if (whenHidden === 'disable') {
    return <div data-disabled aria-disabled="true" style={{ opacity: 0.5, pointerEvents: 'none' }}>{children}</div>;
  }

  // lock
  return (
    <div data-locked aria-disabled="true" title={lockMessage} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
      {children}
      <span style={{ fontSize: '0.7em' }}>🔒</span>
    </div>
  );
}
