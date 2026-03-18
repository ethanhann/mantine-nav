'use client';

import { useCallback, useState } from 'react';
import type { SidebarVariant } from '../types';

export interface UseSidebarVariantOptions {
  defaultVariant?: SidebarVariant;
  onVariantChange?: (variant: SidebarVariant) => void;
}

export interface UseSidebarVariantReturn {
  variant: SidebarVariant;
  setVariant: (variant: SidebarVariant) => void;
  cycleVariant: () => void;
  isFull: boolean;
  isMini: boolean;
  isRail: boolean;
}

const CYCLE_ORDER: SidebarVariant[] = ['full', 'mini', 'rail'];

export function useSidebarVariant({
  defaultVariant = 'full',
  onVariantChange,
}: UseSidebarVariantOptions = {}): UseSidebarVariantReturn {
  const [variant, setVariantState] = useState<SidebarVariant>(defaultVariant);

  const setVariant = useCallback(
    (v: SidebarVariant) => {
      setVariantState(v);
      onVariantChange?.(v);
    },
    [onVariantChange],
  );

  const cycleVariant = useCallback(() => {
    const currentIdx = CYCLE_ORDER.indexOf(variant);
    const nextIdx = (currentIdx + 1) % CYCLE_ORDER.length;
    setVariant(CYCLE_ORDER[nextIdx]!);
  }, [variant, setVariant]);

  return {
    variant,
    setVariant,
    cycleVariant,
    isFull: variant === 'full',
    isMini: variant === 'mini',
    isRail: variant === 'rail',
  };
}
