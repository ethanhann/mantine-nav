# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Action items in the nav tree.
  `href` on a `link` item is now optional, so an item can run only its `onClick` without navigating anywhere.
  Use this for entries like "Sign out" or "Open command palette" that belong in the nav but are not destinations.
  Action items participate fully in keyboard navigation and are activated by Enter like any other item.

  ```tsx
  const items: NavItemType[] = [
    { type: "link", id: "dashboard", label: "Dashboard", href: "/" },
    { type: "link", id: "signout", label: "Sign out", onClick: signOut },
  ];
  ```

  Because an action item has no destination, it is never matched against the current route, never appears in a
  breadcrumb trail, and is never recorded in recently viewed. Clicking one always suppresses default navigation.

  `href` is likewise optional on `NavigateEvent` and on the `NavCommand` entries produced by `flattenNavCommands`.
  Consumers that read `href` from either type now need to handle it being absent.

## [0.8.0] - 2026-07-09

### Added

- `NavBreadcrumbs` component that derives a breadcrumb trail from the nav item tree and renders it with Mantine's
  `Breadcrumbs`.
  Walks the tree to find the active item and builds the ancestor chain automatically.
  Follows the WAI-ARIA Breadcrumb pattern (`<nav aria-label="Breadcrumb">`, `aria-current="page"` on the current item).
  Supports `showIcons`, `renderItem`, `separator`, `rootEntry` (e.g. a "Home" link prepended to the trail), slot-based
  `classNames`/`styles`, and `labels` for localization.
  Uses `linkComponent`/`hrefProp` from `NavShell` context for router integration.
- `useNavBreadcrumbs` hook that returns the ordered breadcrumb entries from root to the active item.
  Accepts the same `currentPath` and `matcher` options as `useActiveNavItem`.
- Cross-tab sync for all persisted state.
  `usePersistedList` (and its consumers `usePinnedItems`, `useRecentlyViewed`, `useStarredPages`), `useSidebarResize`,
  and `NavShell` collapse persistence now listen for `storage` events, so changes made in one tab are reflected in all
  other same-origin tabs automatically.
- `matchItem` utility function for testing whether a path matches an href using any `ActiveMatcher` strategy.
- `onNavigate` callback on `NavShell` for unified navigation telemetry.
  Fires with a `NavigateEvent` containing `id`, `label`, `href`, `data`, `source`, and `trigger` whenever a user
  activates a link from the sidebar, command palette, or breadcrumbs.
  `source` is `'sidebar'`, `'command-palette'`, or `'breadcrumb'`.
  `trigger` is `'mouse'` or `'keyboard'`.
- `NavigateEvent`, `NavigateSource`, and `NavigateTrigger` types.
- `formatCount`, `formatTimestamp`, and `renderNotification` props on `NotificationIndicator`.
  `formatCount` overrides the default "99+" badge display with a custom formatter.
  `formatTimestamp` formats `Date` timestamps (string timestamps are rendered as-is).
  `renderNotification` replaces the default notification item content while preserving the `Menu.Item` wrapper,
  `onRead`, and close behavior.
- `loading` and `skeletonCount` props on `NavGroup`.
  When `loading` is true, the tree is replaced by skeleton placeholder rows that mimic the shape of nav items
  (icon circle and label bar with varying widths).
  `skeletonCount` controls the number of rows (default 5).
- `collapsePersistKey` prop on `NavShell` to persist the sidebar collapse state to `localStorage`.
  The stored value is restored on mount and updated on every toggle.
  Falls back to `defaultDesktopCollapsed` when no stored value exists or the stored value is invalid.
  Ignored when `desktopCollapsed` (controlled mode) is set.
- RTL layout support.
  Components read direction from Mantine's `DirectionProvider` and adapt automatically: tooltip and menu positions
  flip, the collapse toggle icon mirrors, nested group indentation uses CSS logical properties, drag-to-resize
  direction inverts, and keyboard tree navigation swaps ArrowLeft/ArrowRight per WAI-ARIA.
  `useSidebarResize` and `useNavKeyboard` accept a `dir` option for standalone use outside Mantine's direction context.
- Horizontal navigation documentation and a `Recipes/HorizontalNav` Storybook story showing how to compose
  `NavHeader`'s center slot with Mantine's `Tabs` and `useActiveNavItem` for a top-nav layout with a contextual
  sidebar.
- Expanded the SSR documentation with a table of server return values and hydration mismatch risks for every hook
  that depends on browser APIs, guidance for `useResponsiveNav` and `useCurrentPath`, and the "flash of default
  content" trade-off when using `useHydrated()`.

### Removed

- `useReorderableNav` hook and its associated types (`UseReorderableNavOptions`, `UseReorderableNavReturn`).
  The hook was HTML5 drag-only with no keyboard or touch accessibility.
  Consumers who need drag-and-drop reordering should use a dedicated library like `@dnd-kit`.

## [0.7.0] - 2026-07-03

### Added

- `onActiveChange` on `NavGroup` now fires with the resolved active link, or `null` when nothing matches.
  It was previously accepted but never called.
- Controlled state props: `desktopCollapsed` with `onDesktopCollapsedChange` on `NavShell`, `expandedKeys` with
  `onExpandedChange` on `NavGroup`, and `opened` with `onOpenChange` on `UserMenu` and `NotificationIndicator`.
- `NavBurger` component for toggling the mobile drawer in layouts without a header.
- Slot-based `classNames` and `styles` props on `NavShell`, `NavGroup`, `NavSidebar`, and `NavHeader`, backed by the
  new `NavSlotStyles` type.
- `labels` props for localization on `NavShell`, `NavSidebar`, `WorkspaceSwitcher`, `NotificationIndicator`, and
  `ContextSwitcher`, plus an `aria-label` prop on `NavGroup`.
- `loading` skeleton states on `ContextSwitcher`, `WorkspaceSwitcher`, and `NotificationIndicator`, and a
  `placeholder` prop on `WorkspaceSwitcher`.
- `width` and `position` props on `UserMenu`, `NotificationIndicator`, and the `ColorModePicker` menu variant.
- `asideWidth`, `asideBreakpoint`, and `footerHeight` props on `NavShell`.
- Divider items render their optional `label`, and per-item `"aria-label"` fields apply to rendered links and groups.
- Roving tabindex and `aria-selected` in the `NavGroup` tree, and focus management for the mobile drawer: focus moves
  in on open, Tab is trapped, and focus is restored on close.
- `renderWorkspace` on `WorkspaceSwitcher` now customizes dropdown rows in addition to the trigger, and `onSwitch`
  accepts an async handler with built-in pending state.
- `upsertFirst` on `usePersistedList` and a `maxItems` option on `usePinnedItems`.
- `walkNavTree` and `flattenNavTree` tree traversal utilities.
- Previously missing exports: `NavItemBase`, `NavSlotStyles`, `SidebarMode`, `UseExpandedKeysReturn`,
  `UsePersistedListOptions`, `UsePersistedListReturn`, `ContextSwitcherLabels`, and `collectGroupIds`.
- Build sourcemaps and npm keywords.

### Changed

- Keyboard Enter and Space on a link perform native navigation and run the same code path as a mouse click, including
  the item's `onClick` and the tree's `onItemClick`.
- The collapsed rail group menu renders sections, dividers, and nested group children instead of link children only.
- `NotificationIndicator` derives the badge count from unread notifications when `count` is omitted, and marking a
  notification read keeps the dropdown open. Notifications with an `href` still close it.
- `useReorderableNav` derives ordering from the `items` prop, so fresh item data flows through after a reorder and
  newly added items append at the end.
- `useRecentlyViewed` is rebuilt on `usePersistedList` and trims stored lists longer than `maxItems` on load.
- `useResponsiveNav` applies auto-hide and auto-show only on mobile-breakpoint crossings and starts hidden when
  mounted on a mobile viewport.
- `useSidebarResize` clamps persisted widths into the configured bounds, fires `onCollapse` once per downward
  crossing, persists keyboard resizes, and restores body styles when unmounted mid-drag.
- `useRemoteNavItems` re-hydrates items when resolver content changes, so late-loaded icons and swapped handlers
  apply.
- `NavSidebar` animates its header and footer with Mantine `Collapse`, removing the steady-state height clamp, and
  renders standalone outside a `NavShell`.
- `NavShell` resolves `isMobile` from the active theme's breakpoints, memoizes its context value, and its backdrop
  overlay no longer claims a button role.
- The `ColorModePicker` toggle aria-label wording changed to "X, switch to Y", and its menu variant marks the active
  mode with `aria-current` and a check icon.
- `"use client"` directives are preserved in the published build, restoring Next.js App Router compatibility.
- `engines.node` relaxed from `>=24` to `>=20`.

### Deprecated

- `sectionMaxHeight` on `NavSidebar`. Sections no longer clamp their height, and the prop is ignored.
- `ariaLabel` and the per-string label props (`placeholder`, `searchPlaceholder`, `searchAriaLabel`, `emptyMessage`)
  on `ContextSwitcher`, in favor of `"aria-label"` and `labels`.
- `maxPinned` on `usePinnedItems`, in favor of `maxItems`.

### Removed

- The unimplemented `animation` and `transitionDuration` props on `NavGroup`.
- The unimplemented `collapsedWidth` option on `useSidebarResize`, `reorderScope` on `useReorderableNav`, and
  `strategy` on `useResponsiveNav`, along with the orphaned `ResponsiveBreakpointConfig` type.
- The unreachable CommonJS build output (`dist/index.cjs`). The package is ESM-only, matching its `exports` field.
- The `styles.css` import instructions from the README. The library ships no stylesheet.

### Fixed

- Keyboard activation respects `disabled` items.
- Arrow navigation no longer targets hidden children of collapsed groups, and the first ArrowDown from outside the
  tree lands on the first item instead of the second.
- `useReorderableNav` no longer enters an infinite render loop when `items` is a new array reference each render.
- Corrupt or out-of-range persisted sidebar widths fall back to the default instead of applying `NaN` to layout.
- `defaultOpened` groups that arrive after mount now expand in `useNavItems`, matching `NavGroup`.
- JSX `Workspace.logo` nodes render inside the avatar instead of being dropped.
- `ColorModePicker` renders nothing for an empty `modes` array instead of arming a click-time crash.
- `onAccordionChange` and persistence writes no longer double-fire under React StrictMode.
- `useNavVars.resetVars` restores pre-override values instead of clearing them.
- The README Storybook badge links to the correct deployment.

## [0.6.0] - 2026-06-23

### Added

- `mainProps` on `NavShell` for passing props through to `AppShell.Main`.
- The `CommandPalette` search input autofocuses when the palette opens.

### Changed

- Default `NavGroup` variant changed from `subtle` to `light`.
- The package is published as ESM only.
- `engines.node` set to `>=24`, later relaxed to `>=20` in 0.7.0.
- Publishing is now validated with publint and arethetypeswrong.

## [0.5.0] - 2026-06-14

### Added

- `useExpandedKeys` and `usePersistedList` hooks, the shared primitives behind expand/collapse state and the
  localStorage-backed list hooks.
- `compact` variant on `UserMenu` for header placement, with truncation for long names and emails.

## [0.4.0] - 2026-06-11

### Added

- `CommandPalette` component built on `@mantine/spotlight`: Cmd+K shortcut, fuzzy-ranked navigation and actions, and
  Recently Viewed and Starred sections.
- Backend search for `CommandPalette` via an async `search` function, backed by the `useCommandSearch` hook with
  debouncing, request cancellation, and stale-while-revalidate behavior.
- `ContextSwitcher` component for generic context and persona switching, with async pending state.
- `ColorModePicker` component with `toggle`, `segmented`, and `menu` variants.

### Removed

- `ColorSchemeToggle`, replaced by `ColorModePicker`.
  The migration is a drop-in swap, and the default toggle variant cycles System, Light, Dark.

## [0.3.9] - 2026-06-03

### Added

- Timestamps on `NotificationIndicator` notifications, accepting a string or a `Date`.

## Earlier releases

Releases before 0.3.9 predate this changelog.

[Unreleased]: https://github.com/ethanhann/mantine-nav/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/ethanhann/mantine-nav/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/ethanhann/mantine-nav/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ethanhann/mantine-nav/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ethanhann/mantine-nav/compare/v0.3.9...v0.4.0
[0.3.9]: https://github.com/ethanhann/mantine-nav/compare/v0.3.7...v0.3.9
