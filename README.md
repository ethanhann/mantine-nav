# @ethanhann/mantine-nav

[![npm version](https://img.shields.io/npm/v/@ethanhann/mantine-nav.svg)](https://www.npmjs.com/package/@ethanhann/mantine-nav)
[![CI](https://github.com/ethanhann/mantine-nav/actions/workflows/ci.yml/badge.svg)](https://github.com/ethanhann/mantine-nav/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/ethanhann/mantine-nav/blob/main/LICENSE)
[![Coverage](https://img.shields.io/endpoint?url=https://ethanhann.github.io/mantine-nav/coverage-badge.json)](https://ethanhann.github.io/mantine-nav/)
[![Storybook](https://img.shields.io/badge/Storybook-deployed-ff4785.svg)](https://ethanhann.github.io/mantine-nav/)

A React navigation component library built on [Mantine v9](https://mantine.dev).

Provides a responsive app shell, sidebar, header, and nav-tree components with multi-level nesting, keyboard navigation,
and SaaS-oriented building blocks (workspace switcher, user menu, plan badge, notification indicator).

## Installation

```bash
npm install @ethanhann/mantine-nav
```

**Peer dependencies:** React 19+, `@mantine/core` 9+, `@mantine/hooks` 9+, `@mantine/spotlight` 9+, `@tabler/icons-react` 3+.

## Quick Start

Compose `NavShell`, `NavHeader`, `NavSidebar`, and `NavGroup` to get a responsive layout with a collapsible sidebar and
mobile drawer:

```tsx
import {NavShell, NavHeader, NavSidebar, NavGroup} from '@ethanhann/mantine-nav';
import type {NavItemType} from '@ethanhann/mantine-nav';

const items: NavItemType[] = [
    {id: 'home', type: 'link', label: 'Home', href: '/', icon: <HomeIcon/>},
    {
        id: 'products',
        type: 'group',
        label: 'Products',
        icon: <BoxIcon/>,
        children: [
            {id: 'catalog', type: 'link', label: 'Catalog', href: '/products'},
            {id: 'inventory', type: 'link', label: 'Inventory', href: '/products/inventory'},
        ],
    },
    {id: 'div-1', type: 'divider'},
    {id: 'settings', type: 'link', label: 'Settings', href: '/settings'},
];

function App() {
    return (
        <NavShell
            mainProps={{
                // Optionally override AppShell.main props.
            }}
            header={<NavHeader logo={<Logo/>}/>}
            sidebar={
                <NavSidebar>
                    <NavGroup items={items} currentPath={location.pathname}/>
                </NavSidebar>
            }
        >
            {/* page content */}
        </NavShell>
    );
}
```

`NavShell` wraps Mantine's `AppShell` and manages responsive collapse (desktop) and drawer toggling (mobile). Any
descendant can read state via `useNavShell()` or `useOptionalNavShell()`.

Layout is configured with `headerHeight`, `sidebarWidth`, `sidebarCollapsedWidth`, `sidebarBreakpoint`, `asideWidth`,
`asideBreakpoint`, `footerHeight`, `padding`, and `withBorder`.
For layouts without a header, render the exported `NavBurger` anywhere inside the shell to toggle the mobile drawer.
It renders nothing outside a `NavShell`.

Pass `collapsePersistKey` to persist the sidebar collapse state across page reloads:

```tsx
<NavShell collapsePersistKey="app-sidebar-collapsed" sidebar={sidebar}>
    {children}
</NavShell>
```

The stored value is read on mount and written on every toggle.
In controlled mode (`desktopCollapsed` prop), `collapsePersistKey` is ignored since the consumer owns persistence.

## Nav Items

`NavItemType` is a discriminated union with four variants:

```tsx
// Clickable link
{
    id, type
:
    'link', label, href, icon ?, badge ?, disabled ?, external ?, onClick ?, activeMatch ?
}

// Collapsible group containing children
{
    id, type
:
    'group', label, icon ?, badge ?, children
:
    NavItemType[], defaultOpened ?, disabled ?
}

// Non-interactive section header
{
    id, type
:
    'section', label
}

// Horizontal divider with an optional inline label
{
    id, type
:
    'divider', label ?
}
```

All items support `visible?: boolean | (() => boolean)` to hide per role/flag, and `weight?: number` to control sort
order.
Links and groups also accept an `"aria-label"` used as the accessible name of the rendered tree item.

### `onClick` and navigation

A link's `onClick` runs for side effects (analytics, telemetry) and **does not** suppress navigation when the item has a
real `href` — the handler fires first, then the browser (or your `linkComponent`) navigates. Call `e.preventDefault()`
yourself if you need to stop it:

```tsx
// Track, then navigate normally:
{ id: 'pricing', type: 'link', label: 'Pricing', href: '/pricing',
  onClick: () => track('nav_click', { to: '/pricing' }) }

// Action-only item — prevent navigation and open a modal:
{ id: 'feedback', type: 'link', label: 'Send Feedback', href: '#',
  onClick: (e) => { e.preventDefault(); openFeedbackModal(); } }
```

### Custom item rendering

Pass `renderItem={(item, depth) => ReactNode}` to `NavGroup` to fully control how items are drawn. The library wraps your
output so each item keeps its accessibility plumbing — `role="treeitem"`, `data-item-id`, `aria-current` /
`aria-expanded`, roving focus for keyboard navigation, and click routing through `onItemClick`. You supply only the
visuals:

```tsx
<NavGroup
    items={items}
    onItemClick={(item) => router.push(item.href)}
    renderItem={(item) =>
        item.type === 'link' ? (
            <Group justify="space-between" px="sm" py={6}>
                <Group gap="xs">{item.icon}<Text size="sm">{item.label}</Text></Group>
                {item.data?.count ? <Badge circle>{item.data.count}</Badge> : null}
            </Group>
        ) : null
    }
/>
```

## Example: Marketing CRM

```tsx
import {NavShell, NavHeader, NavSidebar, NavGroup} from '@ethanhann/mantine-nav';
import type {NavItemType} from '@ethanhann/mantine-nav';
import {
    IconHome, IconUsers, IconMail, IconTarget,
    IconChartBar, IconSettings, IconCalendar, IconFileText,
} from '@tabler/icons-react';
import {Badge} from '@mantine/core';

const crmItems: NavItemType[] = [
    {id: 'dashboard', type: 'link', label: 'Dashboard', href: '/', icon: <IconHome size={18}/>},

    {id: 'section-engage', type: 'section', label: 'Engage'},

    {
        id: 'contacts',
        type: 'group',
        label: 'Contacts',
        icon: <IconUsers size={18}/>,
        defaultOpened: true,
        children: [
            {id: 'all-contacts', type: 'link', label: 'All Contacts', href: '/contacts'},
            {id: 'segments', type: 'link', label: 'Segments', href: '/contacts/segments'},
            {id: 'lists', type: 'link', label: 'Lists', href: '/contacts/lists'},
        ],
    },

    {
        id: 'campaigns',
        type: 'group',
        label: 'Campaigns',
        icon: <IconMail size={18}/>,
        badge: <Badge size="xs" color="green">2 active</Badge>,
        children: [
            {id: 'email', type: 'link', label: 'Email', href: '/campaigns/email'},
            {id: 'sms', type: 'link', label: 'SMS', href: '/campaigns/sms'},
            {id: 'social', type: 'link', label: 'Social', href: '/campaigns/social'},
        ],
    },

    {id: 'automations', type: 'link', label: 'Automations', href: '/automations', icon: <IconTarget size={18}/>},
    {id: 'calendar', type: 'link', label: 'Calendar', href: '/calendar', icon: <IconCalendar size={18}/>},

    {id: 'div-1', type: 'divider'},
    {id: 'section-analyze', type: 'section', label: 'Analyze'},

    {id: 'reports', type: 'link', label: 'Reports', href: '/reports', icon: <IconChartBar size={18}/>},
    {id: 'templates', type: 'link', label: 'Templates', href: '/templates', icon: <IconFileText size={18}/>},

    {id: 'div-2', type: 'divider'},

    {
        id: 'settings',
        type: 'link',
        label: 'Settings',
        href: '/settings',
        icon: <IconSettings size={18}/>,
        disabled: true
    },
];

function MarketingCRM() {
    return (
        <NavShell
            header={<NavHeader logo={<Logo/>}/>}
            sidebar={
                <NavSidebar>
                    <NavGroup items={crmItems} currentPath={location.pathname} activeMatcher="prefix" accordion/>
                </NavSidebar>
            }
        >
            {/* page content */}
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
<NavGroup items={items} currentPath="/products/inventory" activeMatcher="prefix"/>
```

| Strategy                             | Behavior                                       |
|--------------------------------------|------------------------------------------------|
| `'exact'`                            | `href` must equal `currentPath`                |
| `'prefix'` (default)                 | `currentPath` must start with `href`           |
| `'regex'`                            | `href` is treated as a regex pattern           |
| `RegExp`                             | Match `currentPath` against the provided regex |
| `(currentPath, itemHref) => boolean` | Custom matcher                                 |

Individual items can override the strategy via `activeMatch`.

Subscribe to active-link changes with `onActiveChange`:

```tsx
<NavGroup items={items} currentPath={pathname} onActiveChange={(item) => setBreadcrumbSource(item)}/>
```

The callback fires with the resolved active link whenever it changes, and with `null` when nothing matches.

### Loading State

Pass `loading` to show skeleton placeholder rows while nav items are being fetched:

```tsx
const { items, isLoading } = useRemoteNavItems({ items: apiResponse });

<NavGroup items={items} loading={isLoading} currentPath={pathname} />
```

`skeletonCount` controls how many rows appear (default 5).

## NavBreadcrumbs

`NavBreadcrumbs` derives a breadcrumb trail from the nav item tree and renders it with Mantine's `Breadcrumbs`.
It walks the tree to find the active item and builds the ancestor chain automatically.

```tsx
import { NavBreadcrumbs } from '@ethanhann/mantine-nav';

<NavBreadcrumbs items={items} currentPath={location.pathname} />
```

Prepend a root entry (e.g. "Home") with the `rootEntry` prop:

```tsx
<NavBreadcrumbs
    items={items}
    currentPath={location.pathname}
    rootEntry={{ label: 'Home', href: '/', icon: <IconHome size={14} /> }}
    showIcons
/>
```

The component renders a `<nav aria-label="Breadcrumb">` with ancestor items as links and the current page as a
`<span aria-current="page">`, following the WAI-ARIA Breadcrumb pattern.
Ancestor groups without an `href` render as plain text.
It uses `linkComponent`/`hrefProp` from `NavShell` context, so router integration works the same as `NavGroup`.

Additional props: `separator` (passes through to Mantine's `Breadcrumbs`), `showIcons` (renders item icons inline),
`renderItem` (full control over each entry), `matcher` (same active matching strategies as `NavGroup`), and `labels`
for localization (`labels.nav` overrides the `aria-label`).

For headless use, the `useNavBreadcrumbs` hook returns the raw breadcrumb entries:

```tsx
import { useNavBreadcrumbs } from '@ethanhann/mantine-nav';

const { breadcrumbs, activeItem } = useNavBreadcrumbs({
    items,
    currentPath: location.pathname,
    rootEntry: { label: 'Home', href: '/' },
});
// breadcrumbs: Array<{ id, label, href?, icon?, item, isCurrentPage }>
```

## NavHeader

```tsx
<NavHeader
    logo={<Logo/>}
    environment={{label: 'Staging', color: 'orange'}}
    rightSection={
        <Group gap="xs">
            <NotificationIndicator count={3}/>
            <ColorModePicker/>
            <UserMenu user={user} menuItems={menuItems}/>
        </Group>
    }
>
    {/* Optional center content (breadcrumbs, search, etc.) */}
</NavHeader>
```

### Horizontal Navigation

`NavGroup` is a vertical tree component. For horizontal top-nav or tab-bar layouts, compose `NavHeader`'s center
content slot with Mantine's own `Tabs` or `Menubar`:

```tsx
import {Tabs} from '@mantine/core';
import {NavHeader, NavShell, useActiveNavItem} from '@ethanhann/mantine-nav';

const topNav: NavItemType[] = [
    {id: 'home', type: 'link', label: 'Home', href: '/', activeExact: true},
    {id: 'products', type: 'link', label: 'Products', href: '/products'},
    {id: 'settings', type: 'link', label: 'Settings', href: '/settings'},
];

function App() {
    const {activeItem} = useActiveNavItem(topNav, {currentPath: pathname, matcher: 'prefix'});

    return (
        <NavShell
            header={
                <NavHeader logo={<Logo/>}>
                    <Tabs value={activeItem?.href ?? '/'} onChange={(v) => router.push(v!)}>
                        <Tabs.List>
                            {topNav.map((item) => item.type === 'link' && (
                                <Tabs.Tab key={item.id} value={item.href}>{item.label}</Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </Tabs>
                </NavHeader>
            }
        >
            {children}
        </NavShell>
    );
}
```

This gives you Mantine's built-in ARIA `tablist` with keyboard navigation, and `useActiveNavItem` provides active state
matching using the same item data and matcher strategies as the sidebar.
See the **Recipes/HorizontalNav** Storybook story for a full example with a contextual sidebar that changes per
section.

## NavSidebar

`NavSidebar` provides header/body/footer slots. Header and footer hide automatically when the sidebar is collapsed on
desktop:

```tsx
<NavSidebar
    header={<WorkspaceSwitcher workspaces={workspaces} activeWorkspace={current} onSwitch={setWorkspace}/>}
    footer={<UserMenu user={user} menuItems={menuItems}/>}
    collapseTogglePosition="footer"
>
    <NavGroup items={items} currentPath={location.pathname}/>
</NavSidebar>
```

Header and footer sections animate open and closed with Mantine `Collapse` and are never height-clamped while expanded.
The `sectionMaxHeight` prop from earlier versions is deprecated and ignored.
`NavSidebar` also renders outside a `NavShell`, in which case the collapse toggle is omitted.

## Router Integration

Pass a router-aware `linkComponent` (and optionally `hrefProp`) to `NavShell` — all link items in descendant `NavGroup`s
will use it. Items with `external: true` bypass it and render as `<a target="_blank" rel="noopener noreferrer">`.

```tsx
// Next.js
import Link from 'next/link';

<NavShell linkComponent={Link} /* hrefProp defaults to "href" */>...</NavShell>

// React Router
import {Link} from 'react-router-dom';

<NavShell linkComponent={Link} hrefProp="to">...</NavShell>
```

## Controlled State

Layout state is uncontrolled by default, and every stateful surface also accepts a controlled prop pair:

```tsx
// Sidebar collapse
<NavShell desktopCollapsed={collapsed} onDesktopCollapsedChange={setCollapsed} sidebar={sidebar}>...</NavShell>

// Expanded groups
<NavGroup items={items} expandedKeys={expanded} onExpandedChange={setExpanded}/>

// Dropdown menus
<UserMenu user={user} opened={menuOpened} onOpenChange={setMenuOpened}/>
<NotificationIndicator notifications={notifications} opened={opened} onOpenChange={setOpened}/>
```

In uncontrolled mode the change callbacks still fire with the intended value, so they double as event hooks.

## Navigation Telemetry

Pass `onNavigate` to `NavShell` to receive a single callback whenever a user activates a link from any navigation
surface:

```tsx
<NavShell
    onNavigate={(event) => {
        analytics.track('navigation', {
            to: event.href,
            from: event.source,   // 'sidebar' | 'command-palette' | 'breadcrumb'
            trigger: event.trigger, // 'mouse' | 'keyboard'
        });
    }}
    sidebar={sidebar}
>
    {children}
</NavShell>
```

The `NavigateEvent` carries `id`, `label`, `href`, `external`, `data` (the item's generic payload), `source`, and
`trigger`.
It fires alongside existing per-component callbacks (`onItemClick` on `NavGroup`, `onNavigate` on `CommandPalette`),
not instead of them.

## Styling

`NavShell`, `NavGroup`, `NavSidebar`, `NavHeader`, and `NavBreadcrumbs` accept slot-based `classNames` and `styles`
props, so visuals can be themed with plain CSS instead of overriding inline styles.

| Component         | Slots                                         |
|-------------------|-----------------------------------------------|
| `NavShell`        | `header`, `navbar`, `aside`, `footer`, `main` |
| `NavGroup`        | `root`, `item`, `section`, `divider`          |
| `NavSidebar`      | `header`, `body`, `footer`                    |
| `NavHeader`       | `root`, `logo`, `center`, `right`             |
| `NavBreadcrumbs`  | `root`, `item`, `separator`, `currentPage`    |

```tsx
<NavGroup
    items={items}
    classNames={{item: 'app-nav-item'}}
    styles={{root: {padding: 4}}}
/>
```

`UserMenu`, `NotificationIndicator`, `ContextSwitcher`, and the `ColorModePicker` menu variant accept `width` and
`position` for their dropdowns.

## Localization

Every user-facing string can be overridden.
Components with several strings take a `labels` object, and single-string surfaces take an `aria-label` prop:

```tsx
<NavShell labels={{toggleNavigation: 'Menü öffnen'}} sidebar={sidebar}>...</NavShell>
<NavGroup items={items} aria-label="Hauptnavigation"/>
<NavSidebar labels={{expandSidebar: 'Ausklappen', collapseSidebar: 'Einklappen'}}>...</NavSidebar>
<WorkspaceSwitcher
    labels={{
        searchPlaceholder: 'Arbeitsbereiche suchen...',
        createWorkspace: 'Arbeitsbereich erstellen',
        switchWorkspace: (name) => `Arbeitsbereich wechseln, aktuell: ${name}`,
    }}
    {...props}
/>
<NotificationIndicator
    labels={{
        title: 'Benachrichtigungen',
        markAllAsRead: 'Alle als gelesen markieren',
        empty: 'Keine Benachrichtigungen',
        bell: (unread) => `Benachrichtigungen (${unread} ungelesen)`,
    }}
    {...props}
/>
<ContextSwitcher labels={{placeholder: 'Wählen', emptyMessage: 'Keine Treffer'}} {...props}/>
<CommandPalette labels={{pages: 'Seiten', actions: 'Aktionen'}} {...props}/>
```

`ContextSwitcher`'s older per-string props (`placeholder`, `searchPlaceholder`, `searchAriaLabel`, `emptyMessage`) still
work but are deprecated in favor of `labels`.

## Keyboard Navigation and Accessibility

`NavGroup` renders an ARIA tree with a roving tabindex.
Exactly one item sits in the tab order: the last focused item, else the active link, else the first visible item.

| Key             | Behavior                                                                          |
|-----------------|-----------------------------------------------------------------------------------|
| Tab             | Enters or leaves the tree at the roving item                                      |
| Arrow Up/Down   | Moves focus between visible items (wraps while `loopNavigation` is on)            |
| Arrow Right     | Expands a group, or moves to its first child when already open                    |
| Arrow Left      | Collapses a group, or moves focus to the parent group                             |
| Home / End      | Moves to the first or last visible item                                           |
| Enter / Space   | Activates the item: links navigate natively and fire `onClick` and `onItemClick`, groups toggle |
| Characters      | Type-ahead to the next item whose label matches the typed prefix                  |

Disabled items are focusable but not activatable, and children of collapsed groups are skipped.
The active link exposes `aria-current="page"` and `aria-selected`.

The mobile drawer moves focus to its first focusable element on open, traps Tab and Shift+Tab inside, restores focus to
the previously focused element on close, and closes on Escape.

## SaaS Components

```tsx
import {
    WorkspaceSwitcher,
    UserMenu,
    PlanBadge,
    NotificationIndicator,
    ColorModePicker,
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
            <PlanBadge plan="Pro" showUpgrade onUpgrade={() => navigate('/billing')}/>
            <NotificationIndicator
                count={unreadCount}
                notifications={notifications}
                onRead={markRead}
                onReadAll={markAllRead}
            />
            <UserMenu
                user={{id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'Admin'}}
                menuItems={[
                    // `id` is optional but recommended as a stable React key when
                    // labels may repeat; it falls back to label + index otherwise.
                    {id: 'profile', label: 'Profile', onClick: () => navigate('/profile')},
                    {id: 'signout', label: 'Sign out', onClick: signOut, color: 'red', dividerBefore: true},
                ]}
            />
        </>
    }
>
    <NavGroup items={items}/>
</NavSidebar>
```

**WorkspaceSwitcher** notes:

- `onSwitch` may return a promise. The dropdown then shows the built-in pending state and closes once the promise resolves.
- `Workspace.logo` accepts an image URL string or any React node. The workspace name initial is the fallback.
- `renderWorkspace(workspace, isActive)` customizes both the trigger and each dropdown row.
- `loading` renders skeleton rows while the workspace list is being fetched.
- `placeholder` sets the trigger text when the active workspace cannot be resolved from `workspaces`.

**NotificationIndicator** notes:

- The badge count defaults to the number of unread `notifications`. Pass `count` to override it, for example with a server-side total.
- `formatCount` customizes the badge display (e.g., `(n) => n >= 1000 ? \`${(n/1000).toFixed(1)}k\` : String(n)`). When omitted, counts above `maxCount` (default 99) display as `"99+"`.
- `formatTimestamp` formats `Date` timestamps (e.g., relative time via `date-fns`). String timestamps are rendered as-is regardless of this prop.
- `renderNotification` overrides the content of each notification item. The `Menu.Item` wrapper, `onRead`, and close-on-navigate behavior are preserved.
- Marking a notification read keeps the dropdown open. Notifications with an `href` navigate and close it.
- `loading` shows skeleton rows while notifications are being fetched.

**ColorModePicker** props: `variant` (`'toggle' | 'segmented' | 'menu'`), custom `modes`
(`{value, label, icon, onActivate?}`), a controlled `value` with `onChange`, `size`, and `showLabels`.
The toggle variant cycles through `modes` in order.
An empty `modes` array renders nothing.

### ContextSwitcher

`ContextSwitcher` is a generic dropdown for switching the user's acting context — personas, tenants, environments, or
anything else with a "you are acting as X" semantic. `WorkspaceSwitcher` is a thin preset over it.

Items carry a primary `label`, optional `description` (secondary line), `icon`, `badge`, `disabled`, a `section` for
grouped lists, and a `data` payload that is passed back to `onSelect` — no lookup by id needed. `active` is nullable:
when no context is chosen yet, the trigger renders a `placeholder` prompt. The active item shows a check mark and is not
selectable.

Async selection is built in: when `onSelect` returns a promise, the clicked item shows a loader, other items are
disabled, and the menu closes only once the promise resolves (it stays open on rejection, and the new item is never
optimistically marked active — update `active` from your own state when the mutation lands).

A persona switcher for an account that holds multiple roles:

```tsx
import {ContextSwitcher} from '@ethanhann/mantine-nav';

<ContextSwitcher
    items={me.personas.map((p) => ({
        id: `${p.type}:${p.id}`,
        label: p.label,                                                  // "Admin"
        description: p.organization?.name,                               // "Acme Corp"
        section: p.type === 'personal' ? 'Personal' : 'Organization roles',
        data: p,
    }))}
    active={me.actingPersona && `${me.actingPersona.type}:${me.actingPersona.id}`}
    labels={{placeholder: 'Choose a persona'}}
    onSelect={(item) =>
        // Async: the switcher shows pending state until this resolves,
        // then your refetched `me.actingPersona` drives `active`.
        switchPersona.mutateAsync({
            data: {personaType: item.data.type, personaId: item.data.id},
        })
    }
/>
```

Footer affordances: `actions` renders typed action items below a divider (e.g.
`{ id: 'manage', label: 'Manage workspaces', onClick }`), and `footer` accepts arbitrary content. `searchable` filters
on label + description; `maxVisible` caps list height before scrolling.

Rendering escape hatches: `renderItem(item, { active, pending })` replaces item content (the accessible `Menu.Item`
wrapper is kept), and `renderTarget(active, opened, { pending })` replaces the trigger entirely — return any
ref-forwarding element:

```tsx
<ContextSwitcher
    items={items}
    active={activeId}
    onSelect={switchContext}
    renderTarget={(active, opened, {pending}) => (
        <Button variant="subtle" loading={pending}>
            {active?.label ?? 'Choose context'}
        </Button>
    )}
/>
```

Stable `data-testid` hooks for end-to-end tests: `context-switcher-target`, `context-switcher-dropdown`,
`context-switcher-search`, `context-switcher-item-<id>`, `context-switcher-action-<id>`, `context-switcher-empty`. The
pending item and the dropdown carry `data-pending` while a switch is in flight.

## Command Palette

`CommandPalette` is a ⌘K command palette built on [`@mantine/spotlight`](https://mantine.dev/x/spotlight/). It
auto-flattens your nav-item tree into searchable destinations, accepts extra non-navigation `actions`, ranks results
with a lightweight fuzzy matcher, and shows Recently Viewed / Starred sections when the search box is empty.

`@mantine/spotlight` is a peer dependency, install it and import its stylesheet once in your app:

```bash
npm install @mantine/spotlight
```

```tsx
import {CommandPalette, useCommandPalette} from '@ethanhann/mantine-nav';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css'; // required

function App() {
    const palette = useCommandPalette();

    return (
        <>
            <button onClick={palette.open}>Search…</button>

            <CommandPalette
                items={items}
                actions={[
                    {
                        id: 'theme',
                        label: 'Toggle color scheme',
                        keywords: ['dark', 'light'],
                        onSelect: toggleColorScheme
                    },
                    {id: 'logout', label: 'Log out', onSelect: signOut},
                ]}
                // For SPA routing, navigate via your router instead of a full page load:
                onNavigate={(command) => router.push(command.href)}
            />
        </>
    );
}
```

The palette opens on ⌘K / Ctrl+K by default (configurable via `shortcut`, or `null` to disable) and shares a single
instance with `useCommandPalette()` so a trigger button and the shortcut drive the same palette.

Flattening preserves each item's generic `data` payload: `flattenNavCommands<TData>(items)` returns
`NavCommand<TData>[]`, so the source item's `data` is available on every command for use in `onNavigate` and custom
result rendering.

### Backend search source

Pass an async `search` function to surface results from a backend (docs, records, etc.) alongside the local matches.
Local nav/actions match instantly; backend results stream into a **Results** group appended below them:

```tsx
<CommandPalette
    items={items}
    search={async (query, signal) => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {signal});
        const hits = await res.json();
        return hits.map((h) => ({id: h.id, label: h.title, href: h.url, description: h.section}));
    }}
    onNavigate={(command) => router.push(command.href)}
/>
```

The `search` function receives an `AbortSignal`, forward it to `fetch` so superseded requests are canceled.
Behavior follows established search-UX conventions out of the box: the query is **debounced 200ms
** ([Algolia's recommended delay](https://www.algolia.com/doc/ui-libraries/autocomplete/guides/debouncing-sources),
tunable via `searchDebounce`), fires only once the query reaches `minSearchLength` (default 2; `0` also fires on the
empty query for server-side suggestions on open), keeps previous results visible while the next request loads —
including when it fails (stale-while-revalidate), shows a spinner only once a request stalls (`searchStallThreshold`,
default 300ms, so fast responses don't flicker one), dedups backend hits that share an `href` with a *displayed* local
match, caps the Results group at `limit` like the local groups, and shows "Searching…" rather than flashing "Nothing
found" while a request is in flight.
A failed search shows `searchErrorMessage` in the empty slot, or a warning icon in the search input when local rows are
still matching.

Memoize the `search` function (e.g. `useCallback`): swapping in a different function refetches the current query (so
workspace-scoped searches stay fresh), which means an unmemoized inline function costs a superseded request per parent
render.

### Advanced exports

- `useCommandSearch(options)` is the backend-search state machine behind the palette (debounce, abort, supersession, stale-while-revalidate). Use it directly to build a custom search UI.
- `commandPaletteStore` and `commandPaletteControls` expose the shared Spotlight store for imperative open, close, and toggle calls outside React.
- `fuzzyMatch(query, text)` and `rankCommands(query, commands)` are the ranking primitives used for local matches.

## SSR and Next.js

The published build preserves `"use client"` directives, so components and hooks work in the Next.js App Router without
a manual client boundary.

### Server return values

Several hooks depend on browser APIs (`localStorage`, `window.innerWidth`, `window.location`) that are unavailable
during server rendering.
Each returns a deterministic fallback on the server and resolves to the real value after hydration on the client:

| Hook / feature | Server return | Client return | Mismatch risk |
|---|---|---|---|
| `usePinnedItems` | `pinnedItems: []` | Persisted pin IDs | Yes, if localStorage has data |
| `useRecentlyViewed` | `items: []` | Persisted recent items | Yes, if localStorage has data |
| `useStarredPages` | `items: []` | Persisted starred pages | Yes, if localStorage has data |
| `usePersistedList` | `items: []` | Persisted array | Yes, if localStorage has data |
| `useSidebarResize` | `width: defaultWidth` (260) | Persisted width | Yes, if user previously resized |
| `NavShell` with `collapsePersistKey` | `!defaultDesktopCollapsed` (expanded) | Persisted collapse state | Yes, if stored state differs |
| `NavShell` `isMobile` | `false` | `useMediaQuery` result | Yes, on mobile viewports |
| `useResponsiveNav` | `viewportWidth: 1024`, `isDesktop: true` | Real viewport values | Yes, on any viewport below 1024px |
| `useCurrentPath` (without `currentPath` prop) | `"/"` | `window.location.pathname` | Yes, on any page other than `/` |
| `useIsSSR` | `true` | `false` | No (handled by `useSyncExternalStore`) |
| `useHydrated` | `false` | `true` | No |

### Avoiding hydration mismatches

Gate markup that depends on any of the above state with `useHydrated()`.
This applies to all persistence hooks, not just `usePinnedItems`:

```tsx
import {useHydrated, usePinnedItems, useStarredPages} from '@ethanhann/mantine-nav';

const hydrated = useHydrated();
const {pinnedItems} = usePinnedItems(items, {storageKey: 'nav-pins'});
const {items: starred} = useStarredPages({storageKey: 'nav-starred'});

if (!hydrated) return <NavGroup items={items}/>;
// Now safe to render UI that depends on pinnedItems or starred
```

The trade-off is a "flash of default content": the user sees the default (empty) state until JavaScript hydrates, which
can cause a visible layout shift.
For persistence hooks this is usually acceptable because the localStorage read is fast and the shift is a single frame.

For `useCurrentPath`, avoid the `"/"` server fallback by passing `currentPath` from your router:

```tsx
// Next.js App Router
import {usePathname} from 'next/navigation';

<NavGroup items={items} currentPath={usePathname()} />
```

For `useResponsiveNav`, the 1024px server fallback means the hook always reports `isDesktop: true` and
`sidebarMode: "persistent"` during SSR.
On viewports narrower than 1024px this produces a hydration mismatch.
Prefer `NavShell` for responsive layouts (it uses Mantine's `useMediaQuery`, which suppresses the mismatch by
returning `undefined` until the client renders) or gate responsive UI with `useHydrated()`.

`useIsSSR()` returns `true` during server rendering and the first client render.

### Cross-tab sync

All persistence hooks sync across browser tabs via `StorageEvent` listeners.
A change in one tab (pinning an item, resizing the sidebar, toggling collapse) is reflected in all other same-origin
tabs automatically.

## Hooks

### `useNavShell` / `useOptionalNavShell`

Access the shell's sidebar and mobile-drawer state from any descendant of `NavShell`:

```tsx
import {useNavShell} from '@ethanhann/mantine-nav';

function MenuButton() {
    const {isMobile, toggleMobile, desktopCollapsed, toggleDesktop} = useNavShell();
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
const {activeItem, activeHref, isActive} = useActiveNavItem(items, {
    currentPath: '/products/inventory',
    matcher: 'prefix',
});
```

### `useHeadlessSidebar`

Sidebar behavior without any UI — for fully custom sidebars:

```tsx
const sidebar = useHeadlessSidebar({
    items,
    defaultExpanded: ['products'],
});
// { expandedKeys, collapsed, toggleGroup, getItemProps, getGroupProps, ... }
```

### Other Hooks

| Hook                       | Purpose                                                  |
|----------------------------|----------------------------------------------------------|
| `useNavBreadcrumbs`        | Derive breadcrumb entries from a nav tree and current path |
| `useCommandSearch`         | Backend-search state machine used by `CommandPalette`    |
| `useCurrentPath`           | Reactive pathname for active matching                    |
| `useNavItems`              | Flatten, expand/collapse, and traverse item trees        |
| `useExpandedKeys`          | Headless expand/collapse state for a tree (toggle/expand-all/collapse-all) |
| `useNavKeyboard`           | Arrow keys, Home/End, Enter/Space, Escape, type-ahead    |
| `useNavAnimation`          | Transition config that respects `prefers-reduced-motion` |
| `useNavColorScheme`        | Read and toggle light/dark color scheme                  |
| `useNavRegistry`           | Flat dot-notation registration of nav entries            |
| `useNavVars`               | Read/write CSS custom properties, restoring prior values on reset |
| `useSidebarResize`         | Drag-to-resize sidebar with localStorage persistence     |
| `useSidebarVariant`        | Cycle sidebar between `full`, `rail`, `mini`             |
| `useResponsiveNav`         | Mobile/tablet/desktop breakpoint state and helpers       |
| `useReorderableNav`        | Drag-and-drop reordering of nav items                    |
| `useRemoteNavItems`        | Hydrate items from an async source, re-hydrating when resolvers change |
| `usePinnedItems`           | Pin/unpin favorites (localStorage-backed)                |
| `useRecentlyViewed`        | Track recently visited pages (localStorage-backed)       |
| `useStarredPages`          | Star/bookmark pages (localStorage-backed)                |
| `usePersistedList`         | Ordered, localStorage-backed list primitive (add/remove/toggle/reorder/upsertFirst) |
| `useIsSSR` / `useHydrated` | SSR-safety helpers                                       |

## Utilities

| Function                    | Purpose                                                                          |
|-----------------------------|----------------------------------------------------------------------------------|
| `filterVisibleItems(items)` | Recursively drop items where `visible` evaluates to `false`; prunes empty groups |
| `isItemVisible(item)`       | Resolve an item's `visible` flag (boolean or function)                           |
| `sortItemsByWeight(items)`  | Stable sort by `weight` (lower first); recurses into group children              |
| `walkNavTree(items, visit)` | Depth-first traversal; return `false` from `visit` to skip a group's children    |
| `flattenNavTree(items)`     | Flatten a nav tree depth-first into a single list                                |
| `matchItem(path, href, m)` | Test whether a path matches an href using any `ActiveMatcher` strategy           |
| `flattenNavCommands(items)` | Flatten link items into `NavCommand[]` for command palettes                      |
| `fuzzyMatch(query, text)`   | Lightweight fuzzy matcher returning a score and matched indices                  |
| `rankCommands(query, cmds)` | Rank commands with `fuzzyMatch`, best first                                      |

## Development

### Storybook

```bash
npm install
npm run dev             # starts Storybook at http://localhost:6006
npm run storybook:build # build static Storybook site
```

Stories are organized by area:

| Category            | What's covered                                                                      |
|---------------------|-------------------------------------------------------------------------------------|
| **Shell**           | `NavShell` variants, `NavHeader`, `NavSidebar`, mobile drawer viewports, router `linkComponent` integration |
| **NavBreadcrumbs**  | Breadcrumb trails from flat items, deep nesting, root entry, icons, custom rendering  |
| **NavGroup**        | Core tree, external links / onClick items, custom `renderItem`, weight-based ordering |
| **Customization**   | Controlled state, localization, slot styling, loading skeletons, collapsed rail    |
| **SaaS**            | `WorkspaceSwitcher`, `UserMenu`, `PlanBadge`, `NotificationIndicator`               |
| **ContextSwitcher** | Generic context/persona switching — async pending, sections, badges, custom trigger |
| **Hooks**           | `useNavRegistry`, `useRemoteNavItems`, `useSidebarResize`, `useReorderableNav`, `usePinnedItems` |
| **Recipes**         | Full-page layouts — admin dashboard, SaaS platform, documentation site, horizontal nav |

A color scheme toggle in the Storybook toolbar renders every story in light or dark mode.

### Tests

```bash
npm run test:run        # single run
npm run test            # watch mode
npm run test:coverage   # with v8 coverage
```

### Build

```bash
npm run build           # build the library to dist/ (ESM + .d.ts + sourcemaps)
npm run typecheck       # type-check without emitting
```

## License

MIT
