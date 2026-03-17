# Spec 011: Sections & Dividers

## Category
Sidebar-Specific

## Status
Draft

## Summary
Group navigation items under labeled section headers with visual dividers, providing organizational structure within the sidebar.

## Motivation
Long navigation lists become hard to scan without visual grouping. Section headers and dividers create clear categories (e.g., "Main", "Workspace", "Settings") that help users orient themselves quickly — a universal pattern in SaaS sidebars.

## Mantine Foundation
- `Divider` — Visual separator with optional label
- `Text` — Section header labels
- `NavLink` — Items within sections
- `Box` / `Stack` — Layout wrappers

## API Design

### Props

#### `NavSection` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | `undefined` | Section header text; if omitted, only a divider is shown |
| `icon` | `ReactNode` | `undefined` | Optional icon before the section label |
| `collapsible` | `boolean` | `false` | Whether the section can be collapsed |
| `defaultOpened` | `boolean` | `true` | Initial open state if collapsible |
| `rightSection` | `ReactNode` | `undefined` | Content rendered on the right side of the header (e.g., action button) |
| `divider` | `boolean \| 'top' \| 'bottom' \| 'both'` | `'top'` | Where to show dividers relative to the section |
| `labelProps` | `TextProps` | `undefined` | Props passed to the label `Text` component |
| `children` | `ReactNode` | — | Nav items within this section |
| `hiddenInRail` | `boolean` | `false` | Hide section header in rail mode (items still shown) |

#### `NavItem` additions (extends Spec 001)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `section` | `string` | `undefined` | Section key when using declarative config (auto-groups items) |

### Hooks

```typescript
function useNavSections(items: NavItem[]): {
  sections: Array<{
    key: string;
    label: string | undefined;
    items: NavItem[];
  }>;
};
```

## Component Structure

```
<Sidebar>
  <NavSection label="Main" divider="bottom">
    <NavLink label="Dashboard" />
    <NavLink label="Analytics" />
  </NavSection>
  <NavSection label="Workspace">
    <NavLink label="Team" />
    <NavLink label="Projects" />
  </NavSection>
  <NavSection label="Settings" collapsible>
    <NavLink label="General" />
    <NavLink label="Billing" />
  </NavSection>
</Sidebar>
```

## Behavior
- `NavSection` renders a header with an optional label and a `Divider`
- When `collapsible={true}`, clicking the header toggles the section open/closed with a `Collapse` animation
- The header shows a chevron icon when collapsible, flipping based on state
- `rightSection` can hold action buttons (e.g., "Add" button for a projects section)
- In rail mode (Spec 008), section headers are hidden by default (`hiddenInRail={true}`) to save space; dividers remain as thin lines
- In mini mode (Spec 010), section labels are truncated
- When using declarative config with `section` prop on `NavItem`, items are auto-grouped into `NavSection` components via `useNavSections`
- Empty sections (no visible children) are hidden entirely

## Accessibility
- Section header: `role="heading"` with appropriate `aria-level`
- Collapsible section: header acts as disclosure button with `aria-expanded`
- Dividers: `role="separator"`
- Items within a section are wrapped in `role="group"` with `aria-labelledby` pointing to the section header

## Dependencies
- **Spec 001** — Multi-level nesting (sections contain nav items)
- **Spec 008** — Collapsible rail mode (section behavior in rail)
- **Spec 010** — Mini variant (section label truncation)

## Testing Criteria
- [ ] Section header renders with label
- [ ] Divider renders at correct position (top/bottom/both)
- [ ] Collapsible section toggles open/closed
- [ ] `rightSection` renders on header
- [ ] Section headers hidden in rail mode when `hiddenInRail`
- [ ] Empty sections are hidden
- [ ] `useNavSections` groups items by `section` key
- [ ] ARIA roles applied correctly
- [ ] Storybook story with multiple sections

## Open Questions
- Should sections support drag-and-drop reordering (cross-reference Spec 003)?
- Should collapsible section state be part of the `useNav()` context?
