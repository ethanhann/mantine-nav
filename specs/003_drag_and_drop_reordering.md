# Spec 003: Drag-and-Drop Reordering

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Allow users to reorder navigation items via drag-and-drop, persisting the custom order through a callback so the consuming app can save it.

## Motivation
Power users of SaaS tools often want to customize their navigation layout to match their personal workflow. Drag-and-drop reordering is a familiar pattern (e.g., Slack channels, Notion sidebar) that increases user satisfaction and efficiency.

## Mantine Foundation
- `@mantine/hooks` — `useListState` for managing ordered lists
- No built-in DnD in Mantine — we integrate with `@dnd-kit/core` and `@dnd-kit/sortable` as peer dependencies

## API Design

### Props

Extends `NavGroup` from Spec 001:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reorderable` | `boolean` | `false` | Enables drag-and-drop reordering |
| `onReorder` | `(items: NavItem[], from: number, to: number) => void` | `undefined` | Callback with the new item order after a drop |
| `dragHandle` | `boolean` | `true` | Show a dedicated drag handle; when `false`, the entire item is draggable |
| `reorderScope` | `'root' \| 'siblings'` | `'siblings'` | Whether items can only be reordered within their parent group or moved across groups |
| `dragOverlay` | `(item: NavItem) => ReactNode` | `undefined` | Custom render for the dragged item overlay |

### Hooks

```typescript
function useReorderableNav(items: NavItem[]): {
  orderedItems: NavItem[];
  sensors: SensorDescriptor<any>[];  // dnd-kit sensors
  handleDragEnd: (event: DragEndEvent) => void;
  resetOrder: () => void;
};
```

## Component Structure

```
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
    <NavGroup>
      <SortableNavItem id={item.id}>
        <DragHandle />   // Optional grip icon
        <NavLink />
      </SortableNavItem>
    </NavGroup>
  </SortableContext>
  <DragOverlay>
    <NavItemPreview />   // Ghost preview of dragged item
  </DragOverlay>
</DndContext>
```

## Behavior
- When `reorderable={true}`, each nav item becomes a sortable element
- With `dragHandle={true}`, only the handle (grip icon) initiates drag; otherwise the entire row is draggable
- `reorderScope="siblings"` restricts movement to within the same parent group; `"root"` allows moving items between groups at the root level
- During drag, a semi-transparent overlay follows the cursor showing the item being moved
- Drop targets are indicated by a horizontal insertion line
- After drop, `onReorder` is called with the full new item array and the from/to indices
- The component does not persist order internally — the consumer must save and provide the updated `items` prop
- Items inside collapsed groups cannot be drag targets
- Disabled items cannot be dragged

## Accessibility
- Drag handle uses `role="button"` with `aria-label="Reorder <item label>"`
- Keyboard DnD: Space to pick up, arrow keys to move, Space to drop, Escape to cancel
- Live region announces position changes: "Moved <item> from position X to position Y"

## Dependencies
- **Spec 001** — Multi-level nesting (reorder operates on the nav item tree)
- **Peer dependency**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Testing Criteria
- [ ] Drag handle renders when `reorderable={true}`
- [ ] Dragging and dropping reorders items visually
- [ ] `onReorder` fires with correct from/to indices and new array
- [ ] Items stay within parent group when `reorderScope="siblings"`
- [ ] Disabled items are not draggable
- [ ] Collapsed groups are not valid drop targets
- [ ] Keyboard DnD (Space, arrows, Escape) works
- [ ] Drag overlay renders during drag
- [ ] Storybook story with reorderable sidebar

## Open Questions
- Should we support dragging items between nesting levels (promoting/demoting)?
- Is `@dnd-kit` the right choice, or should we also consider `react-beautiful-dnd` (now deprecated) or native HTML DnD?
