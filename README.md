# @ethanhann/nav

A React navigation component library built on [Mantine v8](https://mantine.dev). Provides sidebar navigation, top nav bars, and a combined layout with support for multi-level nesting, keyboard navigation, theming, and SaaS-oriented components.

## Installation

```bash
npm install @ethanhann/nav
```

**Peer dependencies:** React 19+, `@mantine/core` 8+, `@mantine/hooks` 8+.

## Quick Start

Wrap your app with `NavProvider` and use the `Nav` component for a config-driven layout:

```tsx
import { NavProvider, Nav } from '@ethanhann/nav';
import '@ethanhann/nav/styles.css';

const items = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <HomeIcon /> },
  {
    id: 'products',
    type: 'group',
    label: 'Products',
    icon: <BoxIcon />,
    children: [
      { id: 'catalog', type: 'link', label: 'Catalog', href: '/products' },
      { id: 'inventory', type: 'link', label: 'Inventory', href: '/products/inventory' },
    ],
  },
  { id: 'div-1', type: 'divider' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings' },
];

function App() {
  return (
    <NavProvider onNavigate={(href) => router.push(href)}>
      <Nav config={{ items }}>
        <main>{/* page content */}</main>
      </Nav>
    </NavProvider>
  );
}
```

## Sidebar

Use `Sidebar` with `NavGroup` for a standalone sidebar:

```tsx
import { Sidebar, NavGroup } from '@ethanhann/nav';

function AppSidebar() {
  return (
    <Sidebar
      header={<Logo />}
      footer={<UserProfile />}
      expandedWidth={280}
      collapsedWidth={60}
    >
      <NavGroup
        items={items}
        maxDepth={3}
        currentPath={window.location.pathname}
        onItemClick={(item) => navigate(item.href)}
      />
    </Sidebar>
  );
}
```

### Accordion Mode

Restrict open groups so only one is expanded at a time:

```tsx
<NavGroup items={items} accordion accordionScope="sibling" />
```

## NavBar

A horizontal top navigation bar:

```tsx
import { NavBar, NavBreadcrumbs, CommandPaletteSlot, EnvironmentIndicator } from '@ethanhann/nav';

function TopBar() {
  return (
    <NavBar
      logo={<Logo />}
      sticky
      rightSection={
        <>
          <CommandPaletteSlot shortcut="⌘K" onTrigger={openPalette} />
          <EnvironmentIndicator environment="staging" color="#f59e0b" />
        </>
      }
    >
      <NavBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />
    </NavBar>
  );
}
```

## Combined Layout

Use `NavLayout` for a structural approach with both sidebar and navbar:

```tsx
import { NavLayout, Sidebar, NavBar, NavGroup } from '@ethanhann/nav';

function AppShell() {
  return (
    <NavLayout
      sidebar={
        <Sidebar header={<Logo />}>
          <NavGroup items={sidebarItems} currentPath={currentPath} />
        </Sidebar>
      }
      navbar={<NavBar logo={<AppName />} sticky />}
    >
      <main>{/* page content */}</main>
    </NavLayout>
  );
}
```

## Theming

Apply built-in presets or custom color schemes:

```tsx
import { NavThemeProvider } from '@ethanhann/nav';

// Built-in preset
<NavThemeProvider preset="corporate">
  <App />
</NavThemeProvider>

// Custom colors
<NavThemeProvider
  colorScheme={{
    primary: '#6366f1',
    background: '#1e1b4b',
    text: '#e0e7ff',
    activeBackground: '#4338ca',
    activeText: '#ffffff',
    hoverBackground: '#312e81',
  }}
>
  <App />
</NavThemeProvider>
```

Available presets: `minimal`, `corporate`, `playful`.

## SaaS Components

Components for multi-tenant SaaS apps:

```tsx
import { WorkspaceSwitcher, UserMenu, PlanBadge, NotificationBell } from '@ethanhann/nav';

<Sidebar
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
      <PlanBadge plan="Pro" daysRemaining={14} />
      <NotificationBell
        notifications={notifications}
        unreadCount={3}
        onNotificationClick={handleNotification}
      />
      <UserMenu
        user={{ id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'Admin' }}
        menuItems={[
          { label: 'Profile', href: '/profile' },
          { label: 'Sign out', onClick: signOut },
        ]}
      />
    </>
  }
>
  <NavGroup items={items} />
</Sidebar>
```

## Hooks

### `useNav`

Access sidebar and navbar state from the `NavProvider` context:

```tsx
import { useNav } from '@ethanhann/nav';

function MenuButton() {
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapse } = useNav();
  return <button onClick={toggleSidebar}>Menu</button>;
}
```

### `useActiveNavItem`

Track which nav item matches the current path:

```tsx
import { useActiveNavItem } from '@ethanhann/nav';

const active = useActiveNavItem(items, { currentPath: '/products', strategy: 'prefix' });
// active => { id: 'products', label: 'Products', ... }
```

### `useHeadlessSidebar`

Get sidebar behavior without any UI — useful for fully custom sidebars:

```tsx
import { useHeadlessSidebar } from '@ethanhann/nav';

const { collapsed, toggle, width, handlers } = useHeadlessSidebar({
  expandedWidth: 280,
  collapsedWidth: 60,
});
```

### Other Hooks

| Hook | Purpose |
|------|---------|
| `useNavItems` | Filter, search, and flatten nav item trees |
| `useNavKeyboard` | Arrow key navigation and type-ahead search |
| `useNavAnimation` | Transition configuration for expand/collapse |
| `useNavColorScheme` | Read and toggle light/dark color scheme |
| `useSidebarResize` | Drag-to-resize sidebar width |
| `useSidebarVariant` | Switch sidebar between `full`, `compact`, `mini` |
| `useResponsiveNav` | Auto-collapse sidebar at breakpoints |
| `useReorderableNav` | Drag-and-drop reordering of nav items |
| `usePinnedItems` | Pin/unpin favorite nav items |
| `useRecentlyViewed` | Track recently visited pages |
| `useStarredPages` | Star/bookmark pages |

## Development

### Storybook

The component library ships with comprehensive Storybook stories covering every component, hook, and layout pattern. To run Storybook locally:

```bash
npm install
npm run dev
```

This starts Storybook at [http://localhost:6006](http://localhost:6006).

To build a static Storybook site:

```bash
npm run storybook:build
```

Stories are organized by category:

| Category | What's covered |
|----------|---------------|
| **Sidebar** | Core sidebar, rail mode, mini variant, resizable, sections & dividers |
| **NavBar** | Core navbar, mega menu, breadcrumbs, tab style, environment indicator, command palette |
| **Layout** | Combined NavLayout, responsive behavior, print-friendly mode |
| **SaaS** | Workspace switcher, user menu, plan badge, notification bell |
| **Dashboard** | Dashboard switcher, filter panel, recently viewed, starred pages, live data status |
| **Theming** | Preset themes, custom color schemes, dark mode toggle, RTL support |
| **Recipes** | Full-page layouts — admin dashboard, SaaS platform, analytics dashboard, documentation site |

### Tests

```bash
npm run test:run    # single run
npm run test        # watch mode
```

### Build

```bash
npm run build       # build the library to dist/
npm run typecheck   # type-check without emitting
npm run lint        # lint src/
```

## License

MIT
