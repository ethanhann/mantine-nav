# Nav — A React Navigation Component Library

## Overview

**Nav** is a React component library focused on providing flexible, composable, and polished navigation components — specifically **sidebars** and **nav bars**. Rather than reinventing the wheel, Nav builds on top of [Mantine v8](https://mantine.dev/) components, extending them with opinionated defaults, additional layout patterns, and a cohesive API designed for real-world application shells.

## Goals

- **Reusable** — Drop Nav components into any React + Mantine project with minimal setup.
- **Flexible** — Support collapsible sidebars, nested nav groups, responsive breakpoints, top bars, and combined layouts out of the box.
- **Mantine-native** — Leverage Mantine v8's theming, styling (CSS modules / `styles` API), and built-in components (`AppShell`, `NavLink`, `Burger`, `Group`, etc.) so everything stays consistent with the rest of a Mantine-based app.
- **Composable** — Expose small, focused building blocks that can be assembled into custom layouts, not just monolithic "mega-components."
- **Accessible** — Inherit Mantine's accessibility foundations (keyboard navigation, ARIA attributes, focus management) and extend them where needed.

## Core Components

### Sidebar

A vertical navigation panel, typically rendered on the left side of the viewport.

| Feature | Description |
|---|---|
| Collapsible | Expand/collapse to icon-only rail mode |
| Nested groups | Support multi-level nav hierarchies with animated expand/collapse |
| Active state | Automatically highlight the active route via React Router, Next.js router, or a custom matcher |
| Footer section | Pin items (e.g., settings, user profile) to the bottom of the sidebar |
| Theming | Fully themeable through Mantine's `MantineProvider` and component-level `styles` / `classNames` props |

### NavBar (Top Bar)

A horizontal navigation bar rendered at the top of the viewport.

| Feature | Description |
|---|---|
| Logo / brand slot | Dedicated area for a logo or app name |
| Nav links | Horizontal link list with active indicators |
| Right section | Slot for actions — search, notifications, user menu, theme toggle |
| Responsive | Collapses into a burger / drawer menu on smaller screens |
| Sticky option | Optionally stick to the top on scroll |

### Combined Layout

A pre-wired layout that pairs the Sidebar and NavBar together inside Mantine's `AppShell`, handling responsive behavior, z-index stacking, and coordinated open/close state automatically.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19.2+ |
| Component foundation | Mantine v8 |
| Styling | Mantine CSS modules / `styles` API |
| Build / bundling | Vite (library mode) or tsup |
| Type safety | TypeScript |
| Documentation / dev | Storybook |
| Testing | Vitest + React Testing Library |

## Getting Started (Planned)

```bash
npm install @nav/core @mantine/core @mantine/hooks
```

```tsx
import { Sidebar, NavBar, NavLayout } from '@nav/core';

function App() {
  return (
    <NavLayout
      navbar={<NavBar logo={<Logo />} />}
      sidebar={
        <Sidebar
          items={[
            { label: 'Dashboard', icon: IconDashboard, href: '/' },
            { label: 'Settings', icon: IconSettings, href: '/settings' },
          ]}
        />
      }
    >
      <MainContent />
    </NavLayout>
  );
}
```

## Roadmap

1. **Project scaffolding** — Initialize package with Vite/tsup, TypeScript, Mantine v8, and Storybook.
2. **Sidebar v1** — Collapsible sidebar with single-level nav links and active state.
3. **NavBar v1** — Top bar with logo, links, right-section slot, and responsive burger menu.
4. **Combined layout** — `NavLayout` component wiring Sidebar + NavBar inside `AppShell`.
5. **Nested navigation** — Multi-level sidebar groups with animated expand/collapse.
6. **Theming & customization** — Document theming patterns; ship a handful of preset themes.
7. **Testing & docs** — Full test coverage and Storybook stories for every component.
8. **Publish** — Release to npm as `@nav/core`.

## License

TBD
