import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { NavIconProvider, useNavIcon } from './NavIconProvider';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NavIconProvider
      defaultSize={24}
      defaultStroke={2}
      resolver={(name) => (name === 'home' ? '🏠' : null)}
    >
      {children}
    </NavIconProvider>
  );
}

describe('Spec 039: NavIconProvider + useNavIcon', () => {
  it('resolves string icon via resolver', () => {
    const { result } = renderHook(() => useNavIcon(), { wrapper });
    const resolved = result.current.resolveIcon('home');
    expect(resolved).toBe('🏠');
  });

  it('falls back to text for unknown string icons', () => {
    const { result } = renderHook(() => useNavIcon(), { wrapper });
    const resolved = result.current.resolveIcon('unknown');
    // Returns a span with the text
    expect(resolved).toBeTruthy();
  });

  it('passes through ReactNode icons', () => {
    const { result } = renderHook(() => useNavIcon(), { wrapper });
    const icon = <svg data-testid="icon" />;
    expect(result.current.resolveIcon(icon)).toBe(icon);
  });

  it('returns default size and stroke', () => {
    const { result } = renderHook(() => useNavIcon(), { wrapper });
    expect(result.current.defaultSize).toBe(24);
    expect(result.current.defaultStroke).toBe(2);
  });

  it('works without provider (defaults)', () => {
    const { result } = renderHook(() => useNavIcon());
    expect(result.current.defaultSize).toBe(20);
    expect(result.current.defaultStroke).toBe(1.5);
  });
});
