import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavAnimation } from './useNavAnimation';

// Mock useReducedMotion
vi.mock('@mantine/hooks', () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from '@mantine/hooks';

describe('Spec 013: useNavAnimation', () => {
  it('returns default config', () => {
    const { result } = renderHook(() => useNavAnimation());
    expect(result.current.config.enabled).toBe(true);
    expect(result.current.config.duration).toBe(200);
    expect(result.current.config.timingFunction).toBe('ease');
    expect(result.current.config.reducedMotion).toBe('system');
  });

  it('enabled: false makes all transitions instant', () => {
    const { result } = renderHook(() => useNavAnimation({ enabled: false }));
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.duration).toBe(0);
  });

  it('reducedMotion: "system" respects media query', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() => useNavAnimation({ reducedMotion: 'system' }));
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.duration).toBe(0);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('reducedMotion: "reduce" halves duration', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() =>
      useNavAnimation({ reducedMotion: 'reduce', duration: 200 }),
    );
    expect(result.current.duration).toBe(100);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('component-level duration overrides work', () => {
    const { result } = renderHook(() => useNavAnimation({ duration: 500 }));
    expect(result.current.duration).toBe(500);
  });

  it('getTransitionProps returns resolved values', () => {
    const { result } = renderHook(() => useNavAnimation({ duration: 300 }));
    const props = result.current.getTransitionProps('collapse');
    expect(props.duration).toBe(300);
    expect(props.timingFunction).toBe('ease');
  });
});
