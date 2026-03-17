'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type IconResolver = (name: string) => ReactNode | null;

interface NavIconContextValue {
  resolver?: IconResolver;
  defaultSize: number;
  defaultStroke: number;
}

const NavIconContext = createContext<NavIconContextValue>({
  defaultSize: 20,
  defaultStroke: 1.5,
});

export interface NavIconProviderProps {
  children: ReactNode;
  resolver?: IconResolver;
  defaultSize?: number;
  defaultStroke?: number;
}

export function NavIconProvider({
  children,
  resolver,
  defaultSize = 20,
  defaultStroke = 1.5,
}: NavIconProviderProps) {
  const value = useMemo(
    () => ({ resolver, defaultSize, defaultStroke }),
    [resolver, defaultSize, defaultStroke],
  );
  return (
    <NavIconContext.Provider value={value}>{children}</NavIconContext.Provider>
  );
}

export interface UseNavIconReturn {
  resolveIcon: (icon: ReactNode | string) => ReactNode;
  defaultSize: number;
  defaultStroke: number;
}

export function useNavIcon(): UseNavIconReturn {
  const { resolver, defaultSize, defaultStroke } = useContext(NavIconContext);

  const resolveIcon = useMemo(
    () => (icon: ReactNode | string): ReactNode => {
      if (typeof icon === 'string') {
        if (resolver) {
          const resolved = resolver(icon);
          if (resolved) return resolved;
        }
        // Fallback: render string as text (emoji or text icon)
        return <span aria-hidden="true">{icon}</span>;
      }
      return icon;
    },
    [resolver],
  );

  return { resolveIcon, defaultSize, defaultStroke };
}
