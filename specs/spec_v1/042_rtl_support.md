# Spec 042: RTL Support

## Category
Theming & Customization

## Status
Draft

## Summary
Full right-to-left layout support for all navigation components, enabling use in RTL languages (Arabic, Hebrew, Persian, Urdu) with correct mirroring of layout, icons, and animations.

## Motivation
RTL support is essential for internationalized applications serving users in the Middle East, North Africa, and other RTL-language regions. Navigation components need correct mirroring — sidebar on the right, arrows flipped, indentation reversed.

## Mantine Foundation
- `DirectionProvider` — Mantine's RTL support wrapper
- `useDirection` — Read current direction
- Mantine components support RTL via CSS logical properties
- `dir="rtl"` attribute

## API Design

### Props

#### `NavLayout` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dir` | `'ltr' \| 'rtl'` | inherited | Override text direction |

No additional component-level props are needed — RTL support is handled at the CSS level via logical properties.

### Hooks

```typescript
function useNavDirection(): {
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  isLTR: boolean;
};
```

## Component Structure

No new components. All existing components mirror automatically:

```
// LTR:
// ┌──────────┬───────────────────────┐
// │ Sidebar  │  Main Content         │
// │  > Item  │                       │
// │  > Item  │                       │
// └──────────┴───────────────────────┘

// RTL:
// ┌───────────────────────┬──────────┐
// │  Main Content         │ Sidebar  │
// │                       │  Item <  │
// │                       │  Item <  │
// └───────────────────────┴──────────┘
```

## Behavior
- All CSS uses logical properties (`margin-inline-start` vs `margin-left`, `padding-inline-end` vs `padding-right`, etc.)
- Sidebar renders on the right side in RTL mode
- Indentation/nesting indents from the right
- Expand/collapse chevrons point left when collapsed, right when expanded (flipped from LTR)
- Resize handle appears on the left edge of the sidebar (its start edge)
- Rail mode collapse toggle points right to collapse, left to expand
- Drag-and-drop handles appear on the right side of items
- Breadcrumb separators remain `/` but direction is reversed
- Animations (slide-in) mirror direction
- `dir` can be set on `NavLayout` or inherited from Mantine's `DirectionProvider`

## Accessibility
- `dir="rtl"` attribute set on navigation container
- Screen readers read content in the correct direction
- Keyboard navigation: ArrowLeft opens groups (opposite of LTR)

## Dependencies
- **Spec 006** — Keyboard navigation (arrow key semantics flip)
- **Spec 008** — Collapsible rail mode (toggle direction flips)
- **Spec 009** — Resizable width (handle position flips)
- **Spec 003** — Drag-and-drop reordering (handle position flips)

## Testing Criteria
- [ ] Sidebar renders on the right in RTL
- [ ] Indentation is from the right
- [ ] Chevrons flip correctly
- [ ] Resize handle on correct side
- [ ] Keyboard arrow semantics reversed
- [ ] Animations mirror
- [ ] All CSS uses logical properties (no `left`/`right`)
- [ ] Breadcrumbs render in correct direction
- [ ] Storybook story with RTL toggle

## Open Questions
- Should there be a per-component `dir` override for mixed-direction UIs?
- How to handle icons that have inherent directionality (e.g., arrows)?
