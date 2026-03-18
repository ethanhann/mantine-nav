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

## Feature List

### Navigation Structure & Behavior

- **Multi-level nesting** — Support 2–3+ levels deep for complex app hierarchies
- **Accordion mode** — Option to allow only one group open at a time, or independent expand/collapse
- **Drag-and-drop reordering** — Let users rearrange nav items to suit their workflow
- **Pinned / favorite items** — Users can pin frequently used pages for quick access
- **Route-aware active state** — Highlight active items with wildcard and pattern matching support
- **Keyboard navigation** — Arrow keys, Home/End, type-ahead search within the nav
- **Programmatic API** — Open, close, and navigate via refs or context (`useSidebar`, `useNavBar`)

### Sidebar-Specific

- **Collapsible rail mode** — Shrink to icon-only rail with tooltips on hover
- **Resizable width** — Drag handle to resize the sidebar to a custom width
- **Mini variant** — Slim sidebar that shows truncated labels (between full and rail)
- **Sections & dividers** — Group nav items under labeled section headers with visual separators
- **Scrollable with sticky zones** — Scrollable nav area with pinned header and footer regions
- **Transition animations** — Configurable slide, fade, and width-morph transitions

### NavBar-Specific

- **Mega menu dropdowns** — Multi-column flyout menus for feature-rich top navigation
- **Command palette slot** — Integration point for search / Cmd+K command palette
- **Breadcrumb bar** — Auto-generated breadcrumbs derived from the route hierarchy
- **Tab-style variant** — Horizontal tab navigation style as an alternative to links
- **Environment indicator** — Color-coded strip or badge showing "Staging", "Production", etc.

### SaaS & Multi-Tenant

- **Workspace / org switcher** — Dropdown in the sidebar header to switch between workspaces or organizations
- **User avatar + role badge** — Display user identity and role in the sidebar footer or navbar
- **Plan / tier badge** — Show the current plan (e.g., "Pro", "Enterprise") with an optional upgrade CTA
- **Notification bell** — Bell icon with unread count badge
- **Onboarding progress** — Progress indicator (e.g., "3 of 5 steps complete") for new user setup flows
- **Feature-flag-aware items** — Show or hide nav items based on feature flags or entitlements
- **Invite teammates CTA** — Dedicated slot for team invitation prompts

### Analytics & Dashboard

- **Dashboard quick-switcher** — Jump between saved dashboards from a dropdown or search
- **Date range / filter indicator** — Show the active date range or filter context in the navbar
- **Live data status dot** — Connected / stale / error indicator for real-time data sources
- **Collapsible filter panel** — Sidebar variant purpose-built for dashboard filter controls
- **Recently viewed** — Auto-populated list of recently visited pages
- **Starred / bookmarked pages** — Section for user-bookmarked pages with quick access

### Responsive & Layout

- **Breakpoint-driven toggle** — Automatically switch between persistent sidebar and drawer based on viewport
- **Overlay mode** — Full-screen overlay sidebar on mobile
- **Persistent vs. temporary** — Choose between always-visible and dismissible drawer behavior
- **Coordinated responsive state** — Navbar and sidebar share responsive open/close state
- **Print-friendly** — Automatically hide navigation when printing

### Theming & Customization

- **Light / dark mode** — Full support with per-component overrides
- **Custom color schemes** — Different color accents per nav section
- **Icon library agnostic** — Works with Tabler, Lucide, FontAwesome, or custom SVGs
- **CSS variable surface** — Fine-grained style control via CSS custom properties
- **Preset themes** — Ship with minimal, corporate, and playful theme presets
- **RTL support** — Right-to-left layout for internationalized applications

### Developer Experience

- **Dual API** — Declarative config (JSON/object) and JSX composition modes
- **TypeScript-first** — Strict generics for nav item data, full autocompletion
- **Storybook stories** — Every component and variant documented with interactive stories
- **Headless hooks** — `useSidebar` and `useNavBar` hooks for fully custom rendering
- **SSR / RSC compatible** — Works with server-side rendering and React Server Components

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
