# Spec 009: Resizable Width

## Category
Sidebar-Specific

## Status
Draft

## Summary
Allow users to resize the sidebar width by dragging a handle on its edge, with configurable min/max constraints and optional persistence.

## Motivation
Users have different content density preferences and screen sizes. A resizable sidebar lets them optimize the layout for their needs, a pattern common in IDEs (VS Code), file managers, and admin panels.

## Mantine Foundation
- `AppShell.Navbar` — Width can be set dynamically
- `@mantine/hooks` — `useMove` for drag tracking, `useLocalStorage` for persistence
- No built-in resize handle in Mantine

## API Design

### Props

#### `Sidebar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resizable` | `boolean` | `false` | Enable drag-to-resize |
| `minWidth` | `number` | `180` | Minimum width in pixels |
| `maxWidth` | `number` | `480` | Maximum width in pixels |
| `onResize` | `(width: number) => void` | `undefined` | Callback during resize with current width |
| `onResizeEnd` | `(width: number) => void` | `undefined` | Callback when resize drag ends |
| `persistWidth` | `string \| false` | `false` | localStorage key to persist width; `false` to disable |
| `resizeHandleWidth` | `number` | `4` | Width of the draggable handle area in pixels |

#### `ResizeHandle` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'left' \| 'right'` | `'right'` | Which edge of the sidebar the handle is on |
| `showOnHover` | `boolean` | `true` | Only show the visual indicator on hover |
| `doubleClickReset` | `boolean` | `true` | Double-click resets to default width |

### Hooks

```typescript
function useSidebarResize(options?: {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  persistKey?: string;
}): {
  width: number;
  isResizing: boolean;
  handleProps: {
    onMouseDown: (e: MouseEvent) => void;
    style: CSSProperties;
  };
  resetWidth: () => void;
};
```

## Component Structure

```
<Sidebar resizable minWidth={180} maxWidth={480}>
  <Sidebar.Content>
    ...
  </Sidebar.Content>
  <ResizeHandle position="right" />   // Rendered on the trailing edge
</Sidebar>
```

## Behavior
- The resize handle is a thin vertical bar on the sidebar's trailing edge
- `showOnHover={true}`: handle becomes visible (color change + cursor) on hover
- Dragging the handle resizes the sidebar in real-time; `onResize` fires during drag
- Width is clamped between `minWidth` and `maxWidth`
- `onResizeEnd` fires when the user releases the mouse
- Double-clicking the handle resets the sidebar to `expandedWidth` (from Spec 008)
- If `persistWidth` is set, the width is saved to `localStorage` and restored on mount
- During resize, `user-select: none` is applied to the document body to prevent text selection
- The cursor changes to `col-resize` during drag
- Resizing below `minWidth` by a threshold (e.g., 40px past min) snaps to collapsed rail mode if `collapsible={true}` (Spec 008)

## Accessibility
- Resize handle: `role="separator"` with `aria-orientation="vertical"` and `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- Keyboard resize: when handle is focused, Left/Right arrow adjusts width by 10px, Shift+arrow by 50px
- `aria-label="Resize sidebar"`

## Dependencies
- **Spec 008** — Collapsible rail mode (snap-to-collapse behavior)
- **Spec 013** — Transition animations (smooth width changes)

## Testing Criteria
- [ ] Drag handle renders on the trailing edge
- [ ] Dragging resizes the sidebar
- [ ] Width stays within min/max bounds
- [ ] `onResize` fires during drag, `onResizeEnd` on release
- [ ] Double-click resets to default width
- [ ] Width persists to localStorage when `persistWidth` set
- [ ] Text selection is prevented during resize
- [ ] Snap-to-collapse works when dragging below threshold
- [ ] Keyboard resize (arrow keys) works on focused handle
- [ ] ARIA attributes are correct
- [ ] Storybook story with resizable sidebar

## Open Questions
- Should the snap-to-collapse threshold be configurable?
- Should resize work on touch devices with touch drag?
