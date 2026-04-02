# Spec 026: Dashboard Quick-Switcher

## Category
Analytics & Dashboard

## Status
Draft

## Summary
A dropdown or search-based component for quickly jumping between saved dashboards, reports, or views from the sidebar or navbar.

## Motivation
Analytics tools with multiple dashboards need fast switching without navigating through a full dashboard list page. A quick-switcher in the navigation reduces friction — patterns seen in Grafana, Datadog, and Metabase.

## Mantine Foundation
- `Select` / `Combobox` — Searchable dropdown
- `Spotlight` — For search-modal variant
- `NavLink` — Dashboard items in sidebar variant

## API Design

### Props

#### `DashboardSwitcher` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dashboards` | `DashboardItem[]` | `[]` | Available dashboards |
| `activeDashboard` | `string` | `undefined` | Currently active dashboard ID |
| `onSwitch` | `(dashboard: DashboardItem) => void` | `undefined` | Switch callback |
| `searchable` | `boolean` | `true` | Enable search |
| `variant` | `'dropdown' \| 'sidebar-list' \| 'modal'` | `'dropdown'` | Display mode |
| `recentCount` | `number` | `5` | Number of recent dashboards to show |
| `onCreate` | `(() => void) \| false` | `undefined` | Create new dashboard action |
| `groupBy` | `'folder' \| 'tag' \| 'none'` | `'none'` | Group dashboards |
| `placeholder` | `string` | `"Switch dashboard..."` | Search placeholder |

#### `DashboardItem` type

```typescript
interface DashboardItem {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  folder?: string;
  tags?: string[];
  lastViewed?: Date;
  shared?: boolean;
  owner?: string;
}
```

### Hooks

```typescript
function useDashboardSwitcher(): {
  activeDashboard: DashboardItem | null;
  recentDashboards: DashboardItem[];
  switchTo: (id: string) => void;
  opened: boolean;
  open: () => void;
  close: () => void;
};
```

## Component Structure

```
<Sidebar.Header>
  <WorkspaceSwitcher />
  <DashboardSwitcher
    dashboards={dashboards}
    activeDashboard="dash-1"
    onSwitch={handleSwitch}
    groupBy="folder"
  />
</Sidebar.Header>
```

## Behavior
- Dropdown variant: renders as a select/combobox in the sidebar header or navbar
- Sidebar-list variant: renders as a nav section with dashboard items
- Modal variant: opens a Spotlight-like search modal (Cmd+D shortcut)
- Recent dashboards appear at the top of the list
- Search filters by name, description, and tags
- Grouped view organizes dashboards by folder or tag
- Active dashboard is highlighted with a checkmark
- Shared dashboards show a shared icon
- `onCreate` adds a "New Dashboard" action at the bottom

## Accessibility
- Dropdown: `role="combobox"` with standard listbox semantics
- Modal: standard dialog with search input focus
- Dashboard items: `role="option"` with descriptive labels

## Dependencies
- **Spec 015** — Command palette slot (modal variant integrates with command palette)
- **Spec 030** — Recently viewed (shares recent tracking logic)

## Testing Criteria
- [ ] Dashboards render in dropdown
- [ ] Search filters correctly
- [ ] Active dashboard highlighted
- [ ] Recent dashboards shown first
- [ ] Group by folder/tag works
- [ ] `onSwitch` fires on selection
- [ ] Modal variant opens with shortcut
- [ ] Storybook story with grouped dashboards

## Open Questions
- Should the switcher support dashboard previews (thumbnails)?
- Should it integrate with the command palette (Spec 015) as a single search?
