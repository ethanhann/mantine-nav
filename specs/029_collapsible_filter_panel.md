# Spec 029: Collapsible Filter Panel

## Category
Analytics & Dashboard

## Status
Draft

## Summary
A sidebar variant purpose-built for dashboard filter controls — collapsible, scrollable, with form-like filter widgets that apply to the dashboard content.

## Motivation
Analytics dashboards need persistent filter panels for dimensions like date, region, product, and segment. A dedicated sidebar variant for filters keeps them accessible without consuming main content space, similar to patterns in Tableau, Power BI, and Google Analytics.

## Mantine Foundation
- `AppShell.Aside` — Right-side panel in AppShell
- `ScrollArea` — Scrollable filter list
- `Collapse` — Collapsible filter groups
- `Drawer` — Mobile filter panel

## API Design

### Props

#### `FilterPanel` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'left' \| 'right'` | `'right'` | Which side of the layout |
| `opened` | `boolean` | `undefined` | Controlled open state |
| `defaultOpened` | `boolean` | `true` | Initial open state |
| `onToggle` | `(opened: boolean) => void` | `undefined` | Toggle callback |
| `width` | `number` | `280` | Panel width |
| `collapsible` | `boolean` | `true` | Whether the panel can be collapsed |
| `children` | `ReactNode` | — | Filter widgets |
| `header` | `ReactNode` | `"Filters"` | Panel header |
| `footer` | `ReactNode` | `undefined` | Panel footer (e.g., Apply/Reset buttons) |
| `applyMode` | `'instant' \| 'manual'` | `'instant'` | Whether filters apply immediately or on explicit apply |
| `onApply` | `() => void` | `undefined` | Callback for manual apply |
| `onReset` | `() => void` | `undefined` | Reset all filters |

#### `FilterGroup` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Filter group label |
| `collapsible` | `boolean` | `true` | Whether the group can be collapsed |
| `defaultOpened` | `boolean` | `true` | Initial state |
| `count` | `number` | `undefined` | Active filter count badge |
| `children` | `ReactNode` | — | Filter controls |

### Hooks

```typescript
function useFilterPanel(): {
  opened: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  activeFilterCount: number;
};
```

## Component Structure

```
<NavLayout>
  <Sidebar />
  <MainContent />
  <FilterPanel position="right" applyMode="manual" onApply={applyFilters}>
    <FilterGroup label="Date Range">
      <DatePickerInput />
    </FilterGroup>
    <FilterGroup label="Region" count={2}>
      <MultiSelect data={regions} />
    </FilterGroup>
    <FilterGroup label="Product">
      <Select data={products} />
    </FilterGroup>
    <FilterPanel.Footer>
      <Button onClick={applyFilters}>Apply</Button>
      <Button variant="subtle" onClick={resetFilters}>Reset</Button>
    </FilterPanel.Footer>
  </FilterPanel>
</NavLayout>
```

## Behavior
- The filter panel renders as a sidebar (left or right) dedicated to filter controls
- `applyMode="instant"`: filter changes apply immediately
- `applyMode="manual"`: changes are staged until the user clicks "Apply"
- `FilterGroup` organizes related filters with collapsible headers
- Active filter count badges show on each group header
- The panel is collapsible to maximize content space
- On mobile, the panel renders as a `Drawer` overlay
- Panel state (open/closed, filter group states) can persist via localStorage
- "Reset" restores all filters to their default values

## Accessibility
- Panel: `role="complementary"` with `aria-label="Filters"`
- Filter groups: `role="group"` with `aria-labelledby` pointing to group header
- Collapsible groups: disclosure pattern with `aria-expanded`
- Apply/Reset buttons: standard button semantics
- Active filter count: `aria-label="<N> active filters"` on the badge

## Dependencies
- **Spec 032** — Breakpoint-driven toggle (mobile drawer behavior)
- **Spec 035** — Coordinated responsive state (coordinates with sidebar)

## Testing Criteria
- [ ] Panel renders on correct side
- [ ] Filter groups render with labels
- [ ] Groups collapse/expand
- [ ] Active filter count badges display
- [ ] `applyMode="manual"` stages changes until Apply
- [ ] `applyMode="instant"` applies immediately
- [ ] Reset clears all filters
- [ ] Mobile renders as Drawer
- [ ] Panel toggle works
- [ ] Storybook story with multiple filter groups

## Open Questions
- Should the filter panel support saved filter presets?
- Should filter state be serialized to URL query params?
