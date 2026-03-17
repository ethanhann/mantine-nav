# Spec 027: Date Range / Filter Indicator

## Category
Analytics & Dashboard

## Status
Draft

## Summary
Display the active date range or filter context in the navbar, providing persistent visibility of the current data scope across dashboard views.

## Motivation
Dashboard users need constant awareness of which time range and filters are active, as these fundamentally change what data is displayed. A navbar indicator prevents confusion from stale or unexpected filter states — a pattern in Mixpanel, Google Analytics, and Datadog.

## Mantine Foundation
- `Badge` — Filter indicator badges
- `DatePickerInput` — Date range selection
- `Popover` — Filter detail panel
- `Group` — Layout for multiple indicators
- `CloseButton` — Clear individual filters

## API Design

### Props

#### `FilterIndicator` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dateRange` | `[Date, Date] \| null` | `undefined` | Active date range |
| `datePreset` | `string` | `undefined` | Named preset (e.g., "Last 7 days") |
| `filters` | `ActiveFilter[]` | `[]` | Active non-date filters |
| `onDateChange` | `(range: [Date, Date]) => void` | `undefined` | Date range change callback |
| `onFilterRemove` | `(filter: ActiveFilter) => void` | `undefined` | Remove filter callback |
| `onClearAll` | `() => void` | `undefined` | Clear all filters |
| `datePresets` | `DatePreset[]` | built-in | Available date range presets |
| `showClearAll` | `boolean` | `true` | Show "Clear all" button when filters active |
| `maxVisible` | `number` | `3` | Max visible filter badges before "+N more" |
| `placement` | `'navbar' \| 'sub-bar' \| 'custom'` | `'navbar'` | Where to render |

#### Supporting types

```typescript
interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  icon?: ReactNode;
  removable?: boolean;
}

interface DatePreset {
  label: string;
  value: [Date, Date];
}
```

### Hooks

```typescript
function useFilterIndicator(): {
  dateRange: [Date, Date] | null;
  filters: ActiveFilter[];
  hasActiveFilters: boolean;
  filterCount: number;
  clearAll: () => void;
  removeFilter: (id: string) => void;
};
```

## Component Structure

```
<NavBar>
  <NavBar.Links />
  <FilterIndicator
    dateRange={[startDate, endDate]}
    datePreset="Last 7 days"
    filters={[
      { id: '1', label: 'Region', value: 'US' },
      { id: '2', label: 'Plan', value: 'Pro' },
    ]}
    onDateChange={handleDateChange}
    onFilterRemove={handleRemove}
  />
</NavBar>

// Renders:
// [📅 Last 7 days ▾]  [Region: US ✕]  [Plan: Pro ✕]  [Clear all]
```

## Behavior
- Date range renders as a clickable badge that opens a date picker popover
- Date presets (Last 7 days, Last 30 days, etc.) are shown as quick-select options in the popover
- Active filters render as removable badges with the filter name and value
- Each filter badge has a close button (✕) that calls `onFilterRemove`
- When filters exceed `maxVisible`, remaining are collapsed into a "+N more" badge that expands on click
- "Clear all" button clears all filters and date range
- When no filters are active, the component renders a minimal "Add filter" trigger or nothing
- Badges are color-coded by filter type for visual distinction

## Accessibility
- Date badge: `aria-label="Date range: <range>"`, `aria-haspopup="dialog"`
- Filter badges: `aria-label="Filter: <label> is <value>"`, close button has `aria-label="Remove <label> filter"`
- Clear all: standard button semantics
- Date picker: inherits Mantine DatePickerInput accessibility

## Dependencies
- None (standalone, placed in NavBar or sub-bar)

## Testing Criteria
- [ ] Date range badge renders with preset label
- [ ] Clicking date badge opens date picker
- [ ] Date presets select correctly
- [ ] Filter badges render with label and value
- [ ] Removing a filter calls `onFilterRemove`
- [ ] Overflow badges collapse with "+N more"
- [ ] "Clear all" clears everything
- [ ] Storybook story with date and filter indicators

## Open Questions
- Should the date picker support comparison ranges (e.g., "vs. previous period")?
- Should filter badges support inline editing (click to change value)?
