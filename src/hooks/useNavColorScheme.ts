'use client';

import { useMemo } from 'react';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';

export interface UseNavColorSchemeReturn {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void;
  isLight: boolean;
  isDark: boolean;
}

export function useNavColorScheme(): UseNavColorSchemeReturn {
  const { setColorScheme, toggleColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');

  return useMemo(
    () => ({
      colorScheme: computedScheme,
      toggleColorScheme,
      setColorScheme,
      isLight: computedScheme === 'light',
      isDark: computedScheme === 'dark',
    }),
    [computedScheme, toggleColorScheme, setColorScheme],
  );
}
