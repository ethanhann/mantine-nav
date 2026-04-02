# Spec 007: Programmatic API

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Expose a ref-based and context-based API for programmatically controlling the sidebar and navbar — open, close, toggle, navigate, expand/collapse groups — from anywhere in the component tree.

## Motivation
Developers need to control navigation state from outside the nav components — e.g., closing the sidebar after a menu action, opening a specific group from a deep link, or toggling the mobile drawer from a header button. A clean programmatic API eliminates prop-drilling and enables complex interactions.

## Mantine Foundation
- React context and `useContext` — Core React patterns
- `forwardRef` / `useImperativeHandle` — For ref-based API

## API Design

### Props

#### `NavProvider` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | App content that needs access to nav state |
| `defaultSidebarOpen` | `boolean` | `true` | Initial sidebar open state |
| `defaultNavbarOpen` | `boolean` | `true` | Initial navbar open state (mobile drawer) |

### Hooks

```typescript
interface NavAPI {
  // Sidebar
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;       // Rail mode (Spec 008)
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleSidebarCollapse: () => void;

  // Navbar
  navbarOpen: boolean;             // Mobile drawer state
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;

  // Navigation groups
  expandGroup: (key: string) => void;
  collapseGroup: (key: string) => void;
  toggleGroup: (key: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  isGroupExpanded: (key: string) => boolean;

  // Navigation
  navigate: (href: string) => void;
  activeHref: string | null;
}

function useNav(): NavAPI;
```

```typescript
// Ref-based alternative
interface NavRef {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  // ... same methods as NavAPI
}
```

#### `NavLayout` ref

| Method | Signature | Description |
|--------|-----------|-------------|
| `openSidebar` | `() => void` | Open the sidebar |
| `closeSidebar` | `() => void` | Close the sidebar |
| `toggleSidebar` | `() => void` | Toggle sidebar open/closed |
| `navigate` | `(href: string) => void` | Programmatically navigate and update active state |

## Component Structure

```
<NavProvider>
  <NavLayout ref={navRef}>
    <NavBar />
    <Sidebar />
    <MainContent />    // Can call useNav() here
  </NavLayout>
</NavProvider>
```

## Behavior
- `NavProvider` holds all nav state in a single context
- `useNav()` reads from the nearest `NavProvider` — throws if used outside one
- All state updates are batched (React 19.2+ automatic batching)
- `navigate(href)` updates the active state and optionally calls a user-provided navigation function (e.g., `router.push`)
- Ref-based API via `useImperativeHandle` exposes the same methods for class component or external usage
- State changes from the programmatic API trigger the same callbacks (`onActiveChange`, `onGroupToggle`, etc.) as user interactions
- `NavProvider` can be used without `NavLayout` for headless scenarios

## Accessibility
- Programmatic state changes update ARIA attributes in the same tick
- Focus is not automatically moved by programmatic API calls (unlike user interactions) — the consumer decides focus management

## Dependencies
- **Spec 001** — Multi-level nesting (group expand/collapse)
- **Spec 005** — Route-aware active state (navigate + activeHref)
- **Spec 008** — Collapsible rail mode (collapse/expand sidebar)

## Testing Criteria
- [ ] `useNav()` throws when used outside `NavProvider`
- [ ] `openSidebar()` / `closeSidebar()` / `toggleSidebar()` update state
- [ ] `expandGroup()` / `collapseGroup()` work correctly
- [ ] `navigate()` updates active state
- [ ] Ref-based API works identically to hook API
- [ ] State changes trigger corresponding callbacks
- [ ] Multiple `useNav()` consumers stay in sync
- [ ] Storybook story with programmatic control buttons

## Open Questions
- Should `navigate()` integrate with the browser's History API directly, or always delegate to a user-provided function?
- Should we expose a `subscribe()` method for external (non-React) consumers?
