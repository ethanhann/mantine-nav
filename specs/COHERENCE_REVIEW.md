# Coherence Review — Nav Spec Suite (001–047)

## Overview

This document evaluates the 47 specs for internal consistency, identifies gaps, flags conflicts, and provides recommendations before implementation begins.

---

## 1. Dependency Graph

### Foundation Layer (implement first)
```
001 Multi-Level Nesting          ← Almost everything depends on this
005 Route-Aware Active State     ← Active state used by most components
007 Programmatic API             ← Context provider used everywhere
044 TypeScript-First             ← Types must be defined before components
040 CSS Variable Surface         ← Theming foundation
```

### Core Layer
```
002 Accordion Mode               ← Extends 001
006 Keyboard Navigation          ← Extends 001, 005
008 Collapsible Rail Mode        ← Extends 001
011 Sections & Dividers          ← Extends 001
012 Scrollable Sticky Zones      ← Extends 008
013 Transition Animations        ← Used by 008, 009, 010
037 Light / Dark Mode            ← Extends 040
```

### Feature Layer
```
003 Drag-and-Drop Reordering     ← Extends 001
004 Pinned / Favorite Items      ← Extends 001, 011
009 Resizable Width              ← Extends 008, 013
010 Mini Variant                 ← Extends 008, 001, 013
014-018 NavBar features          ← Independent cluster
019-025 SaaS features            ← Mostly independent, use 008, 012
026-031 Dashboard features       ← Mostly independent
032-036 Responsive & Layout      ← Extends 007, 008, 013
038 Custom Color Schemes         ← Extends 037, 040
039 Icon Library Agnostic        ← Extends 001, 008
041 Preset Themes                ← Extends 037, 040
042 RTL Support                  ← Cross-cutting
```

### Integration Layer (implement last)
```
043 Dual API                     ← Wraps all components
045 Storybook Stories            ← Documents all components
046 Headless Hooks               ← Extracts logic from all components
047 SSR / RSC Compatible         ← Cross-cutting constraint
```

---

## 2. Identified Issues

### 2.1 Identity / Key System — CRITICAL

**Issue**: Spec 001 defines `NavItem` without a required `key` or `id` field, but multiple specs (003, 004, 006, 007, 030, 031) reference items by key/id. The open question in Spec 001 asks whether to use `key`/`id` or derive from `href`.

**Recommendation**: Add a required `id: string` to `NavItem`. Deriving from `href` breaks when:
- Multiple items share the same href (rare but possible)
- Group items have no href
- Items are dynamically generated

This must be resolved before implementation.

### 2.2 State Management Overlap

**Issue**: Several specs independently manage state that should be centralized:
- Spec 007 (Programmatic API) defines `NavProvider` with sidebar/navbar state
- Spec 008 (Rail Mode) defines `useSidebarCollapse()`
- Spec 010 (Mini Variant) defines `useSidebarVariant()`
- Spec 034 (Persistent vs Temporary) defines `useSidebarMode()`
- Spec 035 (Coordinated Responsive) defines `useResponsiveLayout()`

**Recommendation**: Consolidate into a single `NavProvider` context with all state. Individual hooks (`useSidebarCollapse`, `useSidebarVariant`, etc.) should be convenience wrappers that read from the same context, not independent state stores.

### 2.3 Pinned (004) vs. Starred (031) — Overlap

**Issue**: Spec 004 (Pinned/Favorite Items) and Spec 031 (Starred/Bookmarked Pages) are conceptually similar. The distinction (nav items vs. content pages) is subtle and may confuse developers.

**Recommendation**: Merge into a single "Favorites" system with two modes:
- `source: 'nav'` — pins items from the navigation tree
- `source: 'content'` — bookmarks arbitrary pages

Or keep separate but share the same underlying `useFavorites` hook.

### 2.4 Recently Viewed (030) vs. Pinned (004) vs. Starred (031) — UX Overlap

**Issue**: Three separate specs for "quick access" lists in the sidebar. Users may be confused by having Pinned, Starred, AND Recently Viewed sections simultaneously.

**Recommendation**: Provide a unified "Quick Access" section with tabs/filters: Pinned | Starred | Recent. The three underlying hooks can remain separate, but the UI should consolidate.

### 2.5 NavItem Type — Prop Sprawl

**Issue**: `NavItem` accumulates props across many specs:
- 001: `label`, `icon`, `href`, `children`, `defaultOpened`, `disabled`, `badge`, `data`
- 004: `pinnable`, `pinned`
- 005: `activeMatch`, `activeExact`
- 011: `section`
- 024: `featureFlag`, `entitlement`, `whenHidden`, `lockMessage`, `flagBadge`

This results in a very large type with many optional fields.

**Recommendation**: Use the discriminated union approach from Spec 044 more aggressively. Split into `NavLinkItem`, `NavGroupItem`, `NavSectionHeader`, `NavDividerItem`. Feature-specific props (pinning, flags) should use wrapper components or higher-order config rather than polluting the base type.

### 2.6 Router Integration Strategy

**Issue**: Spec 005 mentions router adapters for React Router and Next.js but doesn't define how they're packaged. Spec 047 (SSR/RSC) mentions a potential `@nav/next` package.

**Recommendation**: Ship router adapters as separate entry points:
- `@nav/core` — Core components, uses `window.location` by default
- `@nav/core/react-router` — React Router adapter
- `@nav/core/next` — Next.js adapter

This avoids bundling unused router code and keeps the core package lightweight.

### 2.7 Peer Dependency Management

**Issue**: Spec 003 (DnD) requires `@dnd-kit/*` as peer dependencies. This is the only spec with an external peer dependency beyond React and Mantine.

**Recommendation**: Make DnD an optional feature. Ship `@nav/dnd` as a separate optional package, or use dynamic imports so the dependency is only loaded when `reorderable={true}`.

### 2.8 Flyout Behavior in Rail/Mini Mode — Underspecified

**Issue**: Specs 008 (Rail) and 010 (Mini) both mention "flyout menus for groups" but don't detail the flyout behavior, positioning, or interaction model.

**Recommendation**: Create a shared `NavFlyout` internal component spec that covers:
- Trigger: hover vs click
- Positioning: right of the sidebar (LTR) or left (RTL)
- Nesting: how deeply nested groups render in flyouts
- Keyboard: how focus moves from rail item to flyout
- Animation: entrance/exit

### 2.9 Animation System — Fragmented

**Issue**: Spec 013 defines a centralized animation system, but specs 008, 009, 010, 032, 033 each reference their own transition props independently.

**Recommendation**: All transition-related props across specs should explicitly state they inherit from Spec 013's `NavAnimationConfig`. Per-component overrides are fine, but the specs should reference the central config rather than defining independent transition props.

### 2.10 Mobile Navigation Pattern — Incomplete

**Issue**: Spec 035 mentions a `bottom-bar` navbar variant (mobile tab bar) as an open question but no spec covers this. Mobile bottom navigation is a very common pattern (iOS/Android tab bars) that many SaaS mobile experiences need.

**Recommendation**: Consider adding Spec 048 for a mobile bottom tab bar, or explicitly include it in Spec 035's responsive config.

---

## 3. Cross-Cutting Concerns

### 3.1 Testing Strategy Consistency
All specs include "Testing Criteria" but the format varies. Standardize:
- Unit tests: Component renders, props work, callbacks fire
- Integration tests: Multiple components interact correctly
- Accessibility tests: axe-core audit, keyboard navigation
- Visual tests: Storybook snapshot (Spec 045)

### 3.2 Performance Considerations
No spec explicitly addresses performance. Large navigation trees (100+ items), frequent re-renders from route changes, and animation performance should be considered. Recommend:
- Virtualization for very long nav lists (optional)
- Memoization strategy for item rendering
- CSS-based animations over JS where possible

### 3.3 Error Boundaries
No spec mentions error handling. What happens when:
- A nav item's `icon` component throws?
- A custom `renderItem` function throws?
- A feature flag provider is unavailable?

Recommend adding a `NavErrorBoundary` or at minimum documenting error handling strategy.

---

## 4. Recommended Implementation Order

### Phase 1: Foundation (Specs: 044, 040, 001, 005, 007, 013)
TypeScript types, CSS variables, core nav item tree, active state, context provider, animation system.

### Phase 2: Sidebar Core (Specs: 002, 006, 008, 011, 012, 037)
Accordion, keyboard nav, rail mode, sections, scroll zones, dark mode.

### Phase 3: Sidebar Features (Specs: 003, 004, 009, 010, 039)
DnD, pinned items, resize, mini variant, icon agnostic.

### Phase 4: NavBar (Specs: 014, 015, 016, 017, 018)
Mega menus, command palette, breadcrumbs, tabs, environment indicator.

### Phase 5: Responsive (Specs: 032, 033, 034, 035, 036)
Breakpoints, overlay, persistent/temp, coordinated state, print.

### Phase 6: SaaS (Specs: 019, 020, 021, 022, 023, 024, 025)
Workspace switcher, user menu, plan badge, notifications, onboarding, flags, invite CTA.

### Phase 7: Dashboard (Specs: 026, 027, 028, 029, 030, 031)
Dashboard switcher, filters, live status, filter panel, recents, starred.

### Phase 8: Theming & DX (Specs: 038, 041, 042, 043, 045, 046, 047)
Color schemes, presets, RTL, dual API, storybook, headless hooks, SSR.

---

## 5. Summary

| Area | Count | Status |
|------|-------|--------|
| Critical issues | 1 | NavItem identity system (2.1) |
| Design overlaps | 3 | Pin/Star/Recent (2.3-2.4), State management (2.2), NavItem sprawl (2.5) |
| Underspecified areas | 2 | Flyout behavior (2.8), Mobile bottom bar (2.10) |
| Architecture decisions needed | 2 | Router packaging (2.6), DnD packaging (2.7) |
| Cross-cutting gaps | 3 | Performance, error handling, test consistency |

**Overall assessment**: The spec suite is comprehensive and well-structured. The dependency graph is acyclic and the implementation order is clear. The critical issue (NavItem identity) must be resolved before Phase 1. The design overlaps (2.3-2.5) should be addressed but are not blockers — they can be refined during implementation.
