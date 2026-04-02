# Spec v3 003: Integration Test Suite -- Multi-Component Flow Testing

## Category
Testing

## Status
Draft

## Summary
Add integration tests that exercise multi-component flows spanning NavShell,
NavSidebar, NavGroup, NavHeader, and SaaS components working together. These
tests verify behavior that unit tests for individual components cannot catch.

## Motivation
The v2 retrospective noted: "Tests cover component rendering and basic interactions
but lack integration tests for complex flows (e.g., full sidebar collapse + keyboard
nav + workspace switch in sequence)."

Unit tests verify each component in isolation. Integration tests verify that
components compose correctly -- context propagation, event bubbling, state
synchronization across providers, and responsive behavior transitions.

## Test Framework

- **Runner:** Vitest (already configured)
- **Rendering:** `@testing-library/react` with `userEvent` for realistic interactions
- **Mantine context:** All integration tests wrap in `MantineProvider` + `NavShell`
- **Viewport simulation:** `window.matchMedia` mocking for responsive breakpoints

## Test File Structure

```
src/__integration__/
  sidebar-collapse.test.tsx
  keyboard-navigation.test.tsx
  workspace-switching.test.tsx
  responsive-transitions.test.tsx
  theme-switching.test.tsx
  full-navigation-flow.test.tsx
```

Vitest config update:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/__integration__/**/*.test.{ts,tsx}',
    ],
  },
});
```

## Test Scenarios

### 1. Sidebar Collapse Flow (`sidebar-collapse.test.tsx`)

Tests the full lifecycle of sidebar collapse/expand with downstream effects:

```typescript
describe('Sidebar collapse flow', () => {
  it('collapses sidebar and adapts nav items to rail mode', async () => {
    // 1. Render full NavShell + NavSidebar + NavGroup
    // 2. Verify sidebar is expanded, nav items show labels
    // 3. Click collapse toggle
    // 4. Verify sidebar enters rail mode (narrow width)
    // 5. Verify nav item labels are hidden
    // 6. Verify tooltips appear on hover for rail items
    // 7. Verify groups show Menu popover instead of inline collapse
    // 8. Click expand toggle
    // 9. Verify sidebar returns to full width with labels
  });

  it('persists collapse state across re-renders', async () => {
    // 1. Collapse sidebar
    // 2. Unmount and remount
    // 3. Verify sidebar starts collapsed
  });

  it('auto-collapses on mobile breakpoint', async () => {
    // 1. Render at desktop width -- sidebar visible
    // 2. Resize to mobile breakpoint
    // 3. Verify sidebar collapses
    // 4. Verify burger menu appears
    // 5. Click burger -- sidebar slides in as overlay
    // 6. Click nav item -- sidebar auto-closes on mobile
  });
});
```

### 2. Keyboard Navigation Flow (`keyboard-navigation.test.tsx`)

Tests keyboard navigation across the full component tree:

```typescript
describe('Keyboard navigation flow', () => {
  it('navigates through nav groups with arrow keys', async () => {
    // 1. Render NavShell with multiple NavGroups
    // 2. Focus first nav item
    // 3. Arrow down through items across groups
    // 4. Arrow right to expand a group
    // 5. Arrow down into children
    // 6. Arrow left to collapse group
    // 7. Verify focus management is correct at each step
  });

  it('supports type-ahead search across all items', async () => {
    // 1. Focus nav tree
    // 2. Type "set" quickly
    // 3. Verify focus jumps to "Settings" item
  });

  it('traps focus in sidebar when open on mobile', async () => {
    // 1. Open sidebar overlay on mobile
    // 2. Tab through items
    // 3. Verify focus stays within sidebar
    // 4. Escape closes sidebar
  });
});
```

### 3. Workspace Switching Flow (`workspace-switching.test.tsx`)

Tests WorkspaceSwitcher interactions with surrounding components:

```typescript
describe('Workspace switching flow', () => {
  it('switches workspace and updates sidebar context', async () => {
    // 1. Render NavShell with WorkspaceSwitcher + NavGroup
    // 2. Verify current workspace displayed
    // 3. Open workspace dropdown
    // 4. Select different workspace
    // 5. Verify onWorkspaceChange callback fires
    // 6. Verify workspace name updates in switcher
    // 7. Verify nav items update (if workspace-dependent)
  });

  it('search filters workspaces in dropdown', async () => {
    // 1. Open workspace dropdown with 10+ workspaces
    // 2. Type search query
    // 3. Verify filtered results
    // 4. Select from filtered list
  });
});
```

### 4. Responsive Transitions (`responsive-transitions.test.tsx`)

Tests behavior changes across breakpoints:

```typescript
describe('Responsive transitions', () => {
  it('transitions from desktop to mobile layout', async () => {
    // 1. Render at desktop width
    // 2. Verify: sidebar visible, header shows full nav, no burger
    // 3. Resize to tablet
    // 4. Verify: sidebar may collapse to rail
    // 5. Resize to mobile
    // 6. Verify: sidebar hidden, burger visible, header compact
  });

  it('preserves active item across breakpoint changes', async () => {
    // 1. Navigate to an item at desktop width
    // 2. Resize to mobile
    // 3. Open sidebar
    // 4. Verify active item is still highlighted
  });
});
```

### 5. Theme Switching (`theme-switching.test.tsx`)

Tests dark mode toggle propagation:

```typescript
describe('Theme switching', () => {
  it('propagates color scheme to all nav components', async () => {
    // 1. Render full shell in light mode
    // 2. Toggle to dark mode
    // 3. Verify NavShell background changes
    // 4. Verify NavSidebar uses dark variant
    // 5. Verify NavGroup items use dark active colors
    // 6. Verify SaaS components (PlanBadge, UserMenu) adapt
  });
});
```

### 6. Full Navigation Flow (`full-navigation-flow.test.tsx`)

End-to-end flow combining multiple interactions:

```typescript
describe('Full navigation flow', () => {
  it('complete user journey through navigation', async () => {
    // 1. Render full app shell with all components
    // 2. Switch workspace via WorkspaceSwitcher
    // 3. Navigate to a nested item via NavGroup click
    // 4. Verify active state updates
    // 5. Collapse sidebar
    // 6. Use keyboard to navigate in rail mode
    // 7. Open notification dropdown
    // 8. Open user menu
    // 9. Verify all interactions work in sequence without conflicts
  });
});
```

## Test Utilities

Create shared helpers for integration tests:

```typescript
// src/__integration__/helpers.tsx
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { NavShell } from '../components/NavShell';

export function renderNavApp(ui: ReactElement, options?: {
  initialPath?: string;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
  colorScheme?: 'light' | 'dark';
}) {
  // Set up matchMedia mock for breakpoint
  // Wrap in MantineProvider + NavShell
  // Return render result + helper functions
}

export function mockMatchMedia(width: number) {
  // Mock window.matchMedia for responsive tests
}

export function resizeTo(width: number) {
  // Trigger resize and matchMedia change
}
```

## Accessibility
Integration tests should verify ARIA attributes are consistent across
component boundaries:
- `aria-current="page"` set on the correct item after navigation
- `aria-expanded` updated on sidebar toggle
- Focus management across component boundaries (sidebar -> main content)

## Dependencies
- **Spec v3 001** -- CSS consolidation (tests should run against final component output)
- **Spec v2 001-008** -- All component specs (integration tests compose all components)

## Testing Criteria
- [ ] All 6 test files pass
- [ ] At least 20 individual test cases across all files
- [ ] Tests run in < 30 seconds total
- [ ] No flaky tests (run 3x to verify)
- [ ] Tests work in CI environment (headless, no browser)
- [ ] `matchMedia` mocking covers all three breakpoints
- [ ] Shared test utilities are documented

## Open Questions
- Should integration tests use `@testing-library/react` or Playwright component
  testing for more realistic browser behavior?
- Should responsive tests mock `matchMedia` or use a real headless browser with
  viewport control?
- How do we test actual CSS transitions (sidebar slide animation) without a real
  browser?
