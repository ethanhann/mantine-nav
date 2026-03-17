'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { NavColorConfig } from '../../types';

export type NavPreset = 'minimal' | 'corporate' | 'playful';

const PRESET_VARS: Record<NavPreset, Record<string, string>> = {
  minimal: {
    '--nav-item-border-radius': '0',
    '--nav-item-active-bg': 'transparent',
    '--nav-item-active-color': 'inherit',
    '--nav-section-header-text-transform': 'none',
    '--nav-section-header-letter-spacing': 'normal',
  },
  corporate: {
    '--nav-item-border-radius': '4px',
    '--nav-section-header-font-weight': '600',
    '--nav-section-header-text-transform': 'uppercase',
  },
  playful: {
    '--nav-item-border-radius': '12px',
    '--nav-transition-duration': '300ms',
    '--nav-transition-timing': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

interface NavThemeContextValue {
  preset?: NavPreset;
  colorConfig?: NavColorConfig;
  dir: 'ltr' | 'rtl';
}

const NavThemeContext = createContext<NavThemeContextValue>({ dir: 'ltr' });

export interface NavThemeProviderProps {
  children: ReactNode;
  preset?: NavPreset;
  presetOverrides?: Record<string, string>;
  colorScheme?: NavColorConfig;
  dir?: 'ltr' | 'rtl';
}

export function NavThemeProvider({
  children,
  preset,
  presetOverrides,
  colorScheme,
  dir = 'ltr',
}: NavThemeProviderProps) {
  const cssVars = useMemo(() => {
    const vars: Record<string, string> = {};
    if (preset && PRESET_VARS[preset]) {
      Object.assign(vars, PRESET_VARS[preset]);
    }
    if (presetOverrides) {
      Object.assign(vars, presetOverrides);
    }
    if (colorScheme) {
      if (colorScheme.primary) vars['--nav-item-active-color'] = colorScheme.primary;
      if (colorScheme.background) vars['--nav-sidebar-bg'] = colorScheme.background;
      if (colorScheme.text) vars['--nav-item-color'] = colorScheme.text;
      if (colorScheme.activeBackground) vars['--nav-item-active-bg'] = colorScheme.activeBackground;
      if (colorScheme.activeText) vars['--nav-item-active-color'] = colorScheme.activeText;
      if (colorScheme.hoverBackground) vars['--nav-item-hover-bg'] = colorScheme.hoverBackground;
      if (colorScheme.border) vars['--nav-sidebar-border-color'] = colorScheme.border;
    }
    return vars;
  }, [preset, presetOverrides, colorScheme]);

  const value = useMemo(
    () => ({ preset, colorConfig: colorScheme, dir }),
    [preset, colorScheme, dir],
  );

  return (
    <NavThemeContext.Provider value={value}>
      <div style={cssVars as React.CSSProperties} dir={dir} data-nav-theme={preset}>
        {children}
      </div>
    </NavThemeContext.Provider>
  );
}

export function useNavTheme() {
  return useContext(NavThemeContext);
}
