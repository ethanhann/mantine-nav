import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useNavColorScheme } from './useNavColorScheme';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <MantineProvider defaultColorScheme="light">{children}</MantineProvider>;
}

describe('Spec 037: useNavColorScheme', () => {
  it('returns current color scheme', () => {
    const { result } = renderHook(() => useNavColorScheme(), { wrapper });
    expect(result.current.colorScheme).toBe('light');
    expect(result.current.isLight).toBe(true);
    expect(result.current.isDark).toBe(false);
  });

  it('provides toggle and set functions', () => {
    const { result } = renderHook(() => useNavColorScheme(), { wrapper });
    expect(typeof result.current.toggleColorScheme).toBe('function');
    expect(typeof result.current.setColorScheme).toBe('function');
  });

  it('returns dark scheme when configured', () => {
    function darkWrapper({ children }: { children: ReactNode }) {
      return <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>;
    }
    const { result } = renderHook(() => useNavColorScheme(), { wrapper: darkWrapper });
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.isLight).toBe(false);
  });
});
