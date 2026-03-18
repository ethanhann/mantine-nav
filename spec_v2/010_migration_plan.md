# Spec v2 010: Migration & Implementation Plan

## Category
Implementation

## Status
Draft

## Summary
Step-by-step plan to rebuild the library from v1 (raw HTML) to v2 (Mantine-native).

## Phase 1: Foundation

### Step 1.1: Add dependencies
- Add `@tabler/icons-react` as peer dependency
- Add `@storybook/addon-essentials` as dev dependency
- Run `npm install`

### Step 1.2: Update Storybook config
- Add `@storybook/addon-essentials` to `.storybook/main.ts`
- Update `.storybook/preview.tsx` with proper MantineProvider + theme
- Update `stories/_data.ts` to use Tabler icons instead of emoji SVGs

### Step 1.3: Implement NavShell (Spec 001)
- Create `src/components/NavShell/NavShell.tsx`
- Wraps `AppShell` with responsive navbar collapse
- Create `NavShellContext` with `useNavShell()` hook
- Add tests and Storybook story

**Verify:** Storybook shows a working AppShell layout with responsive sidebar.

## Phase 2: Core Components

### Step 2.1: Implement NavSidebar (Spec 002)
- Create `src/components/NavSidebar/NavSidebar.tsx`
- Uses `AppShell.Section` + `ScrollArea` for header/content/footer
- Collapse toggle uses `ActionIcon` + `Tooltip`
- Add tests and story

### Step 2.2: Implement NavHeader (Spec 003)
- Create `src/components/NavHeader/NavHeader.tsx`
- Uses `Group` for layout, `Tabs` for tab variant, `Badge` for env indicator
- Add tests and story

### Step 2.3: Rewrite NavGroup (Spec 004)
- Rewrite `src/components/NavGroup/NavGroup.tsx` to use Mantine `NavLink`
- Remove `NavGroup.module.css` (NavLink provides its own styling)
- Port active state matching logic (keep existing hooks)
- Port accordion behavior
- Add rail-mode rendering (Tooltip + Menu)
- Keep existing `useNavItems`, `useActiveNavItem` hooks
- Update tests and stories

**Verify:** Full sidebar with nested navigation renders using Mantine NavLink.

## Phase 3: SaaS Components

### Step 3.1: Rewrite WorkspaceSwitcher (Spec 005)
- Rewrite using `Menu`, `Avatar`, `Group`, `Text`, `TextInput`
- Replace raw `<button>`/`<div>` with Mantine components
- Remove inline styles
- Add tests and story

### Step 3.2: Rewrite UserMenu (Spec 006)
- Rewrite using `Menu`, `Avatar`, `Group`, `Text`
- Replace raw `<button>` with Mantine `Menu.Item`
- Add tests and story

### Step 3.3: Rewrite NotificationBell -> NotificationIndicator (Spec 007)
- Rename to `NotificationIndicator`
- Rewrite using `ActionIcon`, `Indicator`, `Menu`
- Replace emoji bell with `IconBell` from `@tabler/icons-react`
- Add tests and story

### Step 3.4: Rewrite PlanBadge (Spec 008)
- Rewrite using `Badge`, `Anchor`, `Group`
- Remove all inline styles
- Add tests and story

**Verify:** All SaaS components render with full Mantine styling in Storybook.

## Phase 4: Cleanup

### Step 4.1: Remove dead code
- Remove unused CSS modules that are now handled by Mantine
- Remove `src/styles/variables.css` (or pare down to only truly custom vars)
- Remove v1 components that were replaced (e.g., `Nav`, `NavLayout`)
- Update `src/index.ts` exports

### Step 4.2: Update types
- Simplify `NavItemType` discriminated union to simpler `NavItem` interface
- Remove types for removed components
- Ensure all Mantine types are re-exported where useful

### Step 4.3: Rewrite Recipe stories
- AdminDashboard, SaasPlatform, Documentation stories
- All use NavShell + NavSidebar + NavHeader + NavGroup
- Realistic data, Tabler icons, no emojis

### Step 4.4: Final verification
- `npm run typecheck` passes
- `npm run test:run` passes
- `npm run storybook:build` passes
- `npm run build` produces clean output
- All Storybook stories render correctly
- No emoji characters anywhere in source

## What to Keep from v1

These hooks contain genuine logic worth preserving:
- `useActiveNavItem` -- Route-based active state matching
- `useNavItems` -- Tree flattening and expand/collapse state
- `useNavKeyboard` -- Keyboard navigation for tree views
- `useNavAnimation` -- Transition config (simplified)
- `useSidebarResize` -- Drag-to-resize sidebar width
- `useRecentlyViewed` -- Recent page tracking
- `useStarredPages` -- Bookmarked pages

These should be adapted to work with the new Mantine-based components.

## What to Remove from v1

- All custom CSS modules for components Mantine handles (NavBar, NavGroup, NavSection)
- `NavThemeProvider` (replaced by Mantine's `createTheme`)
- `NavProvider` (replaced by `NavShellContext`)
- `CommandPaletteSlot` (use `@mantine/spotlight` directly)
- `EnvironmentIndicator` (just a `Badge`)
- All emoji characters
- Most of `src/styles/variables.css` (Mantine theme vars replace these)
- `FilterPanel`, `DashboardSwitcher`, `LiveDataStatus`, `FilterIndicator`,
  `OnboardingProgress`, `InviteTeamCTA` (these are trivial Mantine compositions
  that don't warrant library components -- provide as recipe stories instead)
