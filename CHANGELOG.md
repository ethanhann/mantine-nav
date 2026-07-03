# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [0.6.0] and earlier

Releases before 0.7.0 predate this changelog.

[Unreleased]: https://github.com/ethanhann/mantine-nav/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/ethanhann/mantine-nav/compare/v0.6.0...v0.7.0
