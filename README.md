# @ethanhann/mantine-nav

[![CI](https://github.com/ethanhann/mantine-nav/actions/workflows/ci.yml/badge.svg)](https://github.com/ethanhann/mantine-nav/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/ethanhann/mantine-nav/blob/main/LICENSE)
[![Coverage](https://img.shields.io/endpoint?url=https://ethanhann.github.io/nav/coverage-badge.json)](https://ethanhann.github.io/nav/)
[![Storybook](https://img.shields.io/badge/Storybook-deployed-ff4785.svg)](https://ethanhann.github.io/nav/)

A React navigation component library built on [Mantine v9](https://mantine.dev). Provides a responsive app shell, sidebar, header, and nav-tree components with multi-level nesting, keyboard navigation, and SaaS-oriented building blocks (workspace switcher, user menu, plan badge, notification indicator).

## Installation

```bash
npm install @ethanhann/mantine-nav
```

**Peer dependencies:** React 19+, `@mantine/core` 9+, `@mantine/hooks` 9+, `@tabler/icons-react` 3+.

## Quick Start

Compose `NavShell`, `NavHeader`, `NavSidebar`, and `NavGroup` to get a responsive layout with a collapsible sidebar and mobile drawer:

```tsx
import { NavShell, NavHeader, NavSidebar, NavGroup } from '@ethanhann/mantine-nav';
import type { NavItemType } from '@ethanhann/mantine-nav';
import '@ethanhann/mantine-nav/styles.css';

const items: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <HomeIcon /> },
  {
    id: 'products',
    type: 'group',
    label: 'Products',
    icon: <BoxIcon />,
    children: [
      { id: 'catalog',   type: 'link', label: 'Catalog',   href: '/products' },
      { id: 'inventory', type: 'link', label: 'Inventory', href: '/products/inventory' },
    ],
  },
  { id: 'div-1', type: 'divider' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings' },
];

function App() {
  return (
    <NavShell
      header={<NavHeader logo={<Logo />} />}
      sidebar={
        <NavSidebar>
          <NavGroup items={items} currentPath={location.pathname} />
        </NavSidebar>
      }
    >
      <main>{/* page content */}</main>
    </NavShell>
  );
}
```

`NavShell` wraps Mantine's `AppShell` and manages responsive collapse (desktop) and drawer toggling (mobile). Any descendant can read state via `useNavShell()` or `useOptionalNavShell()`.

## Nav Items

`NavItemType` is a discriminated union with four variants:

```tsx
// Clickable link
{ id, type: 'link', label, href, icon?, badge?, disabled?, external?, onClick?, activeMatch? }

// Collapsible group containing children
{ id, type: 'group', label, icon?, badge?, children: NavItemType[], defaultOpened?, disabled? }

// Non-interactive section header
{ id, type: 'section', label }

// Horizontal divider
{ id, type: 'divider' }
```

All items support `visible?: boolean | (() => boolean)` to hide per role/flag, and `weight?: number` to control sort order.

## Example: Marketing CRM

```tsx
import { NavShell, NavHeader, NavSidebar, NavGroup } from '@ethanhann/mantine-nav';
import type { NavItemType } from '@ethanhann/mantine-nav';
import {
  IconHome, IconUsers, IconMail, IconTarget,
  IconChartBar, IconSettings, IconCalendar, IconFileText,
} from '@tabler/icons-react';
import { Badge } from '@mantine/core';
import '@ethanhann/mantine-nav/styles.css';

const crmItems: NavItemType[] = [
  { id: 'dashboard', type: 'link', label: 'Dashboard', href: '/', icon: <IconHome size={18} /> },

  { id: 'section-engage', type: 'section', label: 'Engage' },

  {
    id: 'contacts',
    type: 'group',
    label: 'Contacts',
    icon: <IconUsers size={18} />,
    defaultOpened: true,
    children: [
      { id: 'all-contacts', type: 'link', label: 'All Contacts', href: '/contacts' },
      { id: 'segments',     type: 'link', label: 'Segments',     href: '/contacts/segments' },
      { id: 'lists',        type: 'link', label: 'Lists',        href: '/contacts/lists' },
    ],
  },

  {
    id: 'campaigns',
    type: 'group',
    label: 'Campaigns',
    icon: <IconMail size={18} />,
    badge: <Badge size="xs" color="green">2 active</Badge>,
    children: [
      { id: 'email',  type: 'link', label: 'Email',  href: '/campaigns/email' },
      { id: 'sms',    type: 'link', label: 'SMS',    href: '/campaigns/sms' },
      { id: 'social', type: 'link', label: 'Social', href: '/campaigns/social' },
    ],
  },

  { id: 'automations', type: 'link', label: 'Automations', href: '/automations', icon: <IconTarget size={18} /> },
  { id: 'calendar',    type: 'link', label: 'Calendar',    href: '/calendar',    icon: <IconCalendar size={18} /> },

  { id: 'div-1', type: 'divider' },
  { id: 'section-analyze', type: 'section', label: 'Analyze' },

  { id: 'reports',   type: 'link', label: 'Reports',   href: '/reports',   icon: <IconChartBar size={18} /> },
  { id: 'templates', type: 'link', label: 'Templates', href: '/templates', icon: <IconFileText size={18} /> },

  { id: 'div-2', type: 'divider' },

  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <IconSettings size={18} />, disabled: true },
];

function MarketingCRM() {
  return (
    <NavShell
      header={<NavHeader logo={<Logo />} />}
      sidebar={
        <NavSidebar>
          <NavGroup items={crmItems} currentPath={location.pathname} activeMatcher="prefix" accordion />
        </NavSidebar>
      }
    >
      <main>{/* page content */}</main>
    </NavShell>
  );
}
```

This demonstrates:
- **Section headers** to visually group related items ("Engage", "Analyze")
- **Collapsible groups** with nested links (Contacts, Campaigns)
- **Badges** on groups to surface live status ("2 active")
- **Dividers** to separate logical sections
- **Prefix matching** so `/contacts/segments` highlights the Contacts group and the Segments link
- **Accordion mode** so only one group is open at a time
- **Disabled items** for features not yet available

## Active Matching

Pass `activeMatcher` to `NavGroup` to control how the current path maps to items:

```tsx
<NavGroup items={items} currentPath="/products/inventory" activeMatcher="prefix" />
```

| Strategy | Behavior |
|---|---|
| `'exact'` (default) | `href` must equal `currentPath` |
| `'prefix'` | `currentPath` must start with `href` |
| `'regex'` | `href` is treated as a regex pattern |
| `RegExp` | Match `currentPath` against the provided regex |
| `(currentPath, itemHref) => boolean` | Custom matcher |

Individual items can override the strategy via `activeMatch`.

## NavHeader

```tsx
<NavHeader
  logo={<Logo />}
  environment={{ label: 'Staging', color: 'orange' }}
  rightSection={
    <Group gap="xs">
      <NotificationIndicator count={3} />
      <ColorSchemeToggle />
      <UserMenu user={user} menuItems={menuItems} />
    </Group>
  }
>
  {/* Optional center content (breadcrumbs, search, etc.) */}
</NavHeader>
```

## NavSidebar

`NavSidebar` provides header/body/footer slots. Header and footer hide automatically when the sidebar is collapsed on desktop:

```tsx
<NavSidebar
  header={<WorkspaceSwitcher workspaces={workspaces} activeWorkspace={current} onSwitch={setWorkspace} />}
  footer={<UserMenu user={user} menuItems={menuItems} />}
  collapseTogglePosition="footer"
>
  <NavGroup items={items} currentPath={location.pathname} />
</NavSidebar>
```

## Router Integration

Pass a router-aware `linkComponent` (and optionally `hrefProp`) to `NavShell` — all link items in descendant `NavGroup`s will use it. Items with `external: true` bypass it and render as `<a target="_blank" rel="noopener noreferrer">`.

```tsx
// Next.js
import Link from 'next/link';
<NavShell linkComponent={Link} /* hrefProp defaults to "href" */>...</NavShell>

// React Router
import { Link } from 'react-router-dom';
<NavShell linkComponent={Link} hrefProp="to">...</NavShell>
```

## SaaS Components

```tsx
import {
  WorkspaceSwitcher,
  UserMenu,
  PlanBadge,
  NotificationIndicator,
  ColorSchemeToggle,
} from '@ethanhann/mantine-nav';

<NavSidebar
  header={
    <WorkspaceSwitcher
      workspaces={workspaces}
      activeWorkspace={currentWorkspace}
      onSwitch={switchWorkspace}
      onCreate={createWorkspace}
      searchable
    />
  }
  footer={
    <>
      <PlanBadge plan="Pro" showUpgrade onUpgrade={() => navigate('/billing')} />
      <NotificationIndicator
        count={unreadCount}
        notifications={notifications}
        onRead={markRead}
        onReadAll={markAllRead}
      />
      <UserMenu
        user={{ id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'Admin' }}
        menuItems={[
          { label: 'Profile', onClick: () => navigate('/profile') },
          { label: 'Sign out', onClick: signOut, color: 'red', dividerBefore: true },
        ]}
      />
    </>
  }
>
  <NavGroup items={items} />
</NavSidebar>
```

## Hooks

### `useNavShell` / `useOptionalNavShell`

Access the shell's sidebar and mobile-drawer state from any descendant of `NavShell`:

```tsx
import { useNavShell } from '@ethanhann/mantine-nav';

function MenuButton() {
  const { isMobile, toggleMobile, desktopCollapsed, toggleDesktop } = useNavShell();
  return (
    <button onClick={isMobile ? toggleMobile : toggleDesktop}>
      Menu
    </button>
  );
}
```

Use `useOptionalNavShell()` when the component may render outside a `NavShell`.

### `useActiveNavItem`

```tsx
const { activeItem, activeHref, isActive } = useActiveNavItem(items, {
  currentPath: '/products/inventory',
  matcher: 'prefix',
});
```

### `useHeadlessSidebar`

Sidebar behavior without any UI — for fully custom sidebars:

```tsx
const sidebar = useHeadlessSidebar({
  items,
  defaultExpandedKeys: ['products'],
});
// { expandedKeys, collapsed, toggleGroup, getItemProps, getGroupProps, ... }
```

### Other Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentPath` | Reactive pathname for active matching |
| `useNavItems` | Flatten, expand/collapse, and traverse item trees |
| `useNavKeyboard` | Arrow keys, Home/End, Enter/Space, Escape, type-ahead |
| `useNavAnimation` | Transition config that respects `prefers-reduced-motion` |
| `useNavColorScheme` | Read and toggle light/dark color scheme |
| `useNavRegistry` | Flat dot-notation registration of nav entries |
| `useNavVars` | Read/write CSS custom properties for nav tokens |
| `useSidebarResize` | Drag-to-resize sidebar with localStorage persistence |
| `useSidebarVariant` | Cycle sidebar between `full`, `rail`, `mini` |
| `useResponsiveNav` | Mobile/tablet/desktop breakpoint state and helpers |
| `useReorderableNav` | Drag-and-drop reordering of nav items |
| `useRemoteNavItems` | Hydrate items from an async source |
| `usePinnedItems` | Pin/unpin favorites (localStorage-backed) |
| `useRecentlyViewed` | Track recently visited pages (localStorage-backed) |
| `useStarredPages` | Star/bookmark pages (localStorage-backed) |
| `useIsSSR` / `useHydrated` | SSR-safety helpers |

## Utilities

| Function | Purpose |
|---|---|
| `filterVisibleItems(items)` | Recursively drop items where `visible` evaluates to `false`; prunes empty groups |
| `isItemVisible(item)` | Resolve an item's `visible` flag (boolean or function) |
| `sortItemsByWeight(items)` | Stable sort by `weight` (lower first); recurses into group children |

## Development

### Storybook

```bash
npm install
npm run dev             # starts Storybook at http://localhost:6006
npm run storybook:build # build static Storybook site
```

Stories are organized by area:

| Category | What's covered |
|----------|---------------|
| **Shell** | `NavShell` variants, responsive collapse, router `linkComponent` integration |
| **NavGroup** | Core tree, external links / onClick items, weight-based ordering |
| **SaaS** | `WorkspaceSwitcher`, `UserMenu`, `PlanBadge`, `NotificationIndicator` |
| **Hooks** | `useNavRegistry`, `useRemoteNavItems` |
| **Recipes** | Full-page layouts — admin dashboard, SaaS platform, documentation site |

### Tests

```bash
npm run test:run        # single run
npm run test            # watch mode
npm run test:coverage   # with v8 coverage
```

### Build

```bash
npm run build           # build the library to dist/ (ESM + CJS + .d.ts)
npm run typecheck       # type-check without emitting
```

## License

MIT
