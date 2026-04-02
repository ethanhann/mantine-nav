# Spec 033: Overlay Mode

## Category
Responsive & Layout

## Status
Draft

## Summary
Full-screen or partial overlay sidebar on mobile devices, covering the content area with an opaque/semi-transparent backdrop when the navigation is open.

## Motivation
On mobile devices with limited screen real estate, the sidebar must overlay the content rather than push it aside. This prevents layout thrashing and provides a focused navigation experience — the standard mobile navigation pattern in virtually all responsive web apps.

## Mantine Foundation
- `Drawer` — Overlay panel with backdrop
- `Overlay` — Semi-transparent backdrop
- `Transition` — Entrance/exit animations

## API Design

### Props

#### `Sidebar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `overlay` | `boolean` | `false` | Force overlay mode regardless of breakpoint |
| `overlayOpacity` | `number` | `0.5` | Backdrop opacity (0-1) |
| `overlayColor` | `string` | `'black'` | Backdrop color |
| `overlayBlur` | `number` | `0` | Backdrop blur in pixels |
| `overlayCloseOnClick` | `boolean` | `true` | Close sidebar when clicking the overlay |
| `overlayTransition` | `MantineTransition` | `'fade'` | Backdrop transition |
| `sidebarTransition` | `MantineTransition` | `'slide-right'` | Sidebar entrance transition |
| `fullScreen` | `boolean` | `false` | Sidebar takes full screen width on mobile |
| `swipeToClose` | `boolean` | `true` | Enable swipe-to-close gesture |

### Hooks

```typescript
function useOverlayMode(): {
  isOverlay: boolean;
  overlayOpened: boolean;
  open: () => void;
  close: () => void;
};
```

## Component Structure

```
// Overlay mode on mobile:
<div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
  <Overlay opacity={0.5} onClick={close} />   // Backdrop
  <Sidebar.Root style={{ position: 'relative', zIndex: 201 }}>
    <Sidebar.Content />
  </Sidebar.Root>
</div>
```

## Behavior
- In overlay mode, the sidebar renders above the content with a backdrop
- The backdrop prevents interaction with underlying content
- Clicking the backdrop closes the sidebar (if `overlayCloseOnClick`)
- The sidebar slides in from the left (or right for RTL) with a configurable transition
- `fullScreen={true}` makes the sidebar take the full viewport width (common on phones)
- `overlayBlur` applies a CSS `backdrop-filter: blur()` to the backdrop
- `swipeToClose` allows swiping the sidebar toward its origin edge to dismiss
- Body scroll is locked when overlay is active
- Overlay mode is automatically activated below `sidebarBreakpoint` (Spec 032) or forced with `overlay={true}`

## Accessibility
- Overlay sidebar: `role="dialog"` with `aria-modal="true"`
- Focus trap: only elements within the sidebar are focusable
- `Escape` closes the overlay
- Focus returns to the trigger element on close
- Body scroll lock prevents background scrolling

## Dependencies
- **Spec 032** — Breakpoint-driven toggle (overlay activates on mobile)
- **Spec 013** — Transition animations (overlay transitions)

## Testing Criteria
- [ ] Overlay renders with correct opacity and color
- [ ] Clicking overlay closes sidebar
- [ ] Sidebar slides in with transition
- [ ] `fullScreen` takes full width
- [ ] `overlayBlur` applies backdrop blur
- [ ] Body scroll is locked
- [ ] Escape closes overlay
- [ ] Focus trap works
- [ ] Swipe-to-close works on touch
- [ ] Storybook story with mobile overlay

## Open Questions
- Should the overlay support a "slide from bottom" variant (bottom sheet pattern)?
- Should there be a gesture to open the overlay (e.g., swipe from edge)?
