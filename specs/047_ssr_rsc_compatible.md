# Spec 047: SSR / RSC Compatible

## Category
Developer Experience

## Status
Draft

## Summary
Ensure all navigation components work correctly with server-side rendering (SSR) and React Server Components (RSC), avoiding hydration mismatches and supporting Next.js App Router patterns.

## Motivation
Next.js is the leading React framework, and its App Router uses React Server Components by default. Navigation components must work in this environment — rendering correct HTML on the server, hydrating without mismatches on the client, and properly separating server and client concerns.

## Mantine Foundation
- Mantine v8 has full SSR/RSC support
- `'use client'` directive on interactive components
- `MantineProvider` supports SSR

## API Design

### Module structure

```
@nav/core
├── server.ts           // Server-safe exports (no 'use client')
│   ├── NavConfig       // Type-only and config utilities
│   ├── createNavItems  // Pure function to create item tree
│   └── resolveActiveItem // Pure function for active item resolution
│
├── index.ts            // Client components (all have 'use client')
│   ├── Sidebar
│   ├── NavBar
│   ├── NavLayout
│   └── ... all interactive components
│
└── headless.ts         // Headless hooks ('use client')
    ├── useSidebar
    ├── useNavBar
    └── ... all hooks
```

### Props

#### Server-compatible patterns

```typescript
// ✅ Server Component — generates nav data
async function NavSidebar() {
  const navItems = await getNavItems();  // Server-side data fetch
  return <SidebarClient items={navItems} />;
}

// ✅ Client Component — handles interactivity
'use client';
function SidebarClient({ items }: { items: NavItem[] }) {
  return <Sidebar items={items} />;
}
```

#### `NavLayout` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ssrCollapsed` | `boolean` | `false` | Server-rendered collapsed state (prevents flash) |
| `ssrBreakpoint` | `number` | `undefined` | Assumed viewport width for server render |

### Hooks

```typescript
// Safe to use in client components only
function useIsSSR(): boolean;  // Returns true during SSR, false after hydration

function useHydrated(): boolean;  // Returns false during SSR, true after hydration
```

## Component Structure

```
// Next.js App Router pattern:
// app/layout.tsx (Server Component)
import { NavLayoutClient } from './NavLayoutClient';

export default async function RootLayout({ children }) {
  const navItems = await fetchNavItems();

  return (
    <html>
      <body>
        <NavLayoutClient items={navItems}>
          {children}
        </NavLayoutClient>
      </body>
    </html>
  );
}

// app/NavLayoutClient.tsx (Client Component)
'use client';
import { NavLayout, Sidebar, NavBar } from '@nav/core';

export function NavLayoutClient({ items, children }) {
  return (
    <NavLayout>
      <NavBar />
      <Sidebar items={items} />
      <NavLayout.Main>{children}</NavLayout.Main>
    </NavLayout>
  );
}
```

## Behavior
- All interactive components include `'use client'` directive at the top
- No `window`, `document`, or `navigator` access during initial render (these are guarded with `typeof window !== 'undefined'` checks)
- `localStorage` access (for persistence) is deferred to `useEffect`
- CSS-based responsive behavior (media queries) works during SSR without JavaScript
- `ssrCollapsed` allows specifying the server-rendered state to prevent flash of wrong layout
- `ssrBreakpoint` provides a viewport width assumption for server rendering (e.g., 1024px = desktop)
- Hydration: client state takes over after hydration without visual flash
- Pure utility functions (item tree creation, active item resolution) are safe in Server Components
- All client-only hooks throw a clear error if accidentally used in a Server Component

## Accessibility
- Server-rendered HTML includes all ARIA attributes
- Interactive ARIA attributes (`aria-expanded`) are set to their initial values during SSR
- Client hydration updates ARIA attributes to match actual state

## Dependencies
- All other specs — SSR compatibility is a cross-cutting concern

## Testing Criteria
- [ ] Components render correct HTML on the server
- [ ] No hydration mismatch warnings
- [ ] `localStorage` access deferred to `useEffect`
- [ ] No `window`/`document` access during SSR
- [ ] `'use client'` on all interactive components
- [ ] Server utilities work in Server Components
- [ ] `ssrCollapsed` prevents layout flash
- [ ] Client state takes over after hydration
- [ ] Clear error when client hook used in Server Component
- [ ] Works with Next.js App Router
- [ ] Works with Remix
- [ ] Storybook story demonstrating SSR output

## Open Questions
- Should we provide a Next.js-specific adapter package (`@nav/next`)?
- Should server-rendered navigation support streaming SSR (Suspense boundaries)?
