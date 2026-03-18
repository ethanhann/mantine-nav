'use client';

import { useContext } from 'react';
import { NavContext, type NavAPI } from '../components/NavProvider/NavProvider';

export function useNav(): NavAPI {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error('useNav() must be used within a <NavProvider>');
  }
  return ctx;
}
