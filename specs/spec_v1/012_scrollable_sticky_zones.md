# Spec 012: Scrollable with Sticky Zones

## Category
Sidebar-Specific

## Status
Draft

## Summary
Provide a scrollable main navigation area with pinned (sticky) header and footer zones that remain visible regardless of scroll position.

## Motivation
Sidebars often need persistent elements — a logo/org switcher at the top and user profile/settings at the bottom — while the main nav list scrolls. Without explicit sticky zones, developers must manually structure CSS, leading to inconsistent implementations.

## Mantine Foundation
- `ScrollArea` — Mantine's custom scrollbar with overflow management
- `AppShell.Navbar` — Contains the sidebar layout
- `Flex` / `Stack` — Layout structure for zones

## API Design

### Props

#### `Sidebar` layout slots

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | `undefined` | Content pinned to the top of the sidebar |
| `footer` | `ReactNode` | `undefined` | Content pinned to the bottom of the sidebar |
| `children` | `ReactNode` | — | Scrollable main content area |
| `scrollAreaProps` | `ScrollAreaProps` | `undefined` | Props passed to the inner `ScrollArea` |
| `stickyHeader` | `boolean` | `true` | Whether header stays fixed on scroll |
| `stickyFooter` | `boolean` | `true` | Whether footer stays fixed on scroll |
| `headerBorderBottom` | `boolean` | `true` | Show a border below the header |
| `footerBorderTop` | `boolean` | `true` | Show a border above the footer |

#### Alternative compound component API

```tsx
<Sidebar>
  <Sidebar.Header>...</Sidebar.Header>
  <Sidebar.Content>...</Sidebar.Content>   // Scrollable
  <Sidebar.Footer>...</Sidebar.Footer>
</Sidebar>
```

### Hooks

```typescript
function useSidebarScroll(): {
  scrollTo: (position: number) => void;
  scrollToItem: (key: string) => void;
  scrollPosition: number;
  isScrolled: boolean;    // true if scrolled past 0 (useful for header shadow)
  viewport: RefObject<HTMLDivElement>;
};
```

## Component Structure

```
<Sidebar.Root style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
  <Sidebar.Header style={{ flexShrink: 0, position: 'sticky', top: 0 }}>
    <Logo />
    <OrgSwitcher />
  </Sidebar.Header>
  <ScrollArea style={{ flex: 1 }}>
    <Sidebar.Content>
      <NavGroup items={items} />
    </Sidebar.Content>
  </ScrollArea>
  <Sidebar.Footer style={{ flexShrink: 0, position: 'sticky', bottom: 0 }}>
    <UserProfile />
    <CollapseToggle />
  </Sidebar.Footer>
</Sidebar.Root>
```

## Behavior
- The sidebar uses a flex column layout with `height: 100%`
- Header and footer have `flex-shrink: 0` and remain fixed
- The content area fills remaining space and scrolls via `ScrollArea`
- When `isScrolled` is `true`, the header gains a subtle bottom shadow for depth separation
- `scrollToItem(key)` scrolls the content area to bring the specified nav item into view (used by keyboard nav, Spec 006)
- Mantine's `ScrollArea` provides custom scrollbars that match the theme
- In rail mode (Spec 008), header and footer shrink to accommodate narrow width
- Header and footer borders can be toggled off for a more minimal look

## Accessibility
- `ScrollArea` includes proper `role` and `tabIndex` for keyboard scrolling
- `scrollToItem` ensures keyboard-focused items are always visible
- Sticky zones do not interfere with screen reader reading order

## Dependencies
- **Spec 008** — Collapsible rail mode (zones adapt to narrow width)
- **Spec 006** — Keyboard navigation (scrollToItem integration)

## Testing Criteria
- [ ] Header remains visible when content scrolls
- [ ] Footer remains visible when content scrolls
- [ ] Content area scrolls independently
- [ ] `isScrolled` becomes true when scrolled past 0
- [ ] Header shadow appears when scrolled
- [ ] `scrollToItem` scrolls to correct position
- [ ] Zones adapt to rail mode width
- [ ] Custom scrollbar renders from Mantine ScrollArea
- [ ] Storybook story with long nav list demonstrating scroll

## Open Questions
- Should the header/footer have a max height constraint?
- Should scroll position be restored on re-mount (e.g., when navigating back)?
