'use client';

import { useMemo } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import type { NavAnimationConfig } from '../types';

const DEFAULT_CONFIG: NavAnimationConfig = {
  enabled: true,
  duration: 200,
  timingFunction: 'ease',
  reducedMotion: 'system',
};

export interface UseNavAnimationReturn {
  config: NavAnimationConfig;
  isEnabled: boolean;
  duration: number;
  getTransitionProps: (type: 'collapse' | 'width' | 'fade') => {
    duration: number;
    timingFunction: string;
  };
}

export function useNavAnimation(
  overrides?: Partial<NavAnimationConfig>,
): UseNavAnimationReturn {
  const prefersReducedMotion = useReducedMotion();
  const config: NavAnimationConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...overrides }),
    [overrides],
  );

  const isEnabled = useMemo(() => {
    if (!config.enabled) return false;
    if (config.reducedMotion === 'system' && prefersReducedMotion) return false;
    if (config.reducedMotion === 'disable' && prefersReducedMotion) return false;
    return true;
  }, [config.enabled, config.reducedMotion, prefersReducedMotion]);

  const duration = useMemo(() => {
    if (!config.enabled) return 0;
    if (config.reducedMotion === 'disable' && prefersReducedMotion) return 0;
    if (config.reducedMotion === 'reduce' && prefersReducedMotion) {
      return Math.round(config.duration / 2);
    }
    if (config.reducedMotion === 'system' && prefersReducedMotion) return 0;
    return config.duration;
  }, [config.enabled, config.duration, config.reducedMotion, prefersReducedMotion]);

  const getTransitionProps = useMemo(() => {
    return (type: 'collapse' | 'width' | 'fade') => {
      void type; // type-specific overrides can be added in later specs
      return {
        duration,
        timingFunction: config.timingFunction,
      };
    };
  }, [duration, config.timingFunction]);

  return { config, isEnabled, duration, getTransitionProps };
}
