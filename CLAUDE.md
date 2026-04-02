# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React navigation component library (`@ethanhann/mantine-nav`) built on Mantine v8. Provides NavShell, NavGroup, NavHeader, NavSidebar, and SaaS-specific components (WorkspaceSwitcher, UserMenu, PlanBadge, etc.) along with 21+ composable hooks.

## Commands

- **`npm run dev`** — Start Storybook dev server (port 6006)
- **`npm run build`** — Build library to dist/ (ESM + CJS via Vite)
- **`npm run test`** — Run tests in watch mode
- **`npm run test:run`** — Single test run
- **`npx vitest run path/to/file.test.tsx`** — Run a single test file
- **`npm run test:coverage`** — Tests with v8 coverage
- **`npm run typecheck`** — Type-check without emitting

## Architecture

### Core Components

- **NavShell** — Top-level layout wrapper around Mantine AppShell. Provides context (`useNavShell()` / `useOptionalNavShell()`) for sidebar collapse state, responsive behavior, and mobile drawer toggling.
- **NavGroup** — Renders hierarchical navigation item trees. Supports accordion mode, keyboard navigation with type-ahead search, active item matching, and recursive group nesting up to `maxDepth`. Uses an internal `NavItemRenderer` function.
- **NavHeader** — Header bar with logo, center content, right section, and optional environment badge.
- **NavSidebar** — Sidebar wrapper with header/body/footer sections and collapse toggle. Hides header/footer when collapsed.
- **SaaS components** (`src/components/SaaS/`) — WorkspaceSwitcher, UserMenu, PlanBadge, NotificationIndicator, ColorSchemeToggle.

### Type System

`NavItemType` is a discriminated union (`type: 'link' | 'group' | 'section' | 'divider'`) defined in `src/types/nav-item.ts`. Groups contain children arrays for nesting. `ActiveMatcher` supports exact, prefix, regex, and custom function strategies.

### Hooks

Hooks in `src/hooks/` cover: active item matching (`useActiveNavItem`), keyboard navigation (`useNavKeyboard`), sidebar state (`useHeadlessSidebar`, `useSidebarVariant`, `useSidebarResize`), persistence (`usePinnedItems`, `useRecentlyViewed`, `useStarredPages`), animation (`useNavAnimation`), color scheme (`useNavColorScheme`), responsive behavior (`useResponsiveNav`), remote data (`useRemoteNavItems`), drag-and-drop (`useReorderableNav`), and SSR safety (`useIsSSR`, `useHydrated`).

### Key Patterns

- **Context-based state**: NavShell provides sidebar state via React Context
- **Discriminated unions**: Type-safe item rendering via `NavItemType`
- **Headless hooks**: `useHeadlessSidebar` provides behavior without UI coupling
- **Mantine v8 integration**: Built on Mantine's AppShell, NavLink, Collapse, and CSS variable system

## Testing

- **Environment**: Vitest + jsdom + React Testing Library
- **Setup**: `src/test-setup.ts` mocks `matchMedia` and `ResizeObserver` for Mantine compatibility
- **Integration tests**: `src/__integration__/` — full navigation flows, keyboard navigation, sidebar collapse, responsive transitions, theme switching, workspace switching
- **JSDOM caveat**: Mantine's `Collapse` component has a 200ms CSS transition that never completes in jsdom. When querying expanded children, use `getAllByRole('treeitem', { hidden: true })`.

## Build

- Entry: `src/index.ts` (barrel export)
- Output: `dist/` with ESM (`index.js`), CJS (`index.cjs`), types (`index.d.ts`), and `styles.css`
- Externals: React, ReactDOM, Mantine, Tabler icons (peer dependencies)
- Peer deps: React 19+, @mantine/core 8+, @mantine/hooks 8+, @tabler/icons-react 3+
