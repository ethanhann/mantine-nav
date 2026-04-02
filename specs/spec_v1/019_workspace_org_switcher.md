# Spec 019: Workspace / Org Switcher

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A dropdown component in the sidebar header (or navbar) for switching between workspaces, organizations, or tenants, with search, creation, and visual identity per workspace.

## Motivation
Multi-tenant SaaS apps need a way for users to switch between organizations or workspaces. This is a foundational SaaS pattern (Slack, Notion, Linear, Vercel) that should be easy to integrate and visually prominent in the navigation.

## Mantine Foundation
- `Select` or `Combobox` — Dropdown with search
- `Avatar` — Workspace/org icons
- `Group` — Layout for avatar + name + role
- `Popover` — For richer dropdown content

## API Design

### Props

#### `WorkspaceSwitcher` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workspaces` | `Workspace[]` | `[]` | List of available workspaces |
| `activeWorkspace` | `string` | — | Currently active workspace ID |
| `onSwitch` | `(workspace: Workspace) => void` | `undefined` | Callback when user switches workspace |
| `onCreate` | `(() => void) \| false` | `undefined` | Callback for "Create workspace" action; `false` hides it |
| `searchable` | `boolean` | `true` | Enable search within workspace list |
| `showRole` | `boolean` | `true` | Show user's role in each workspace |
| `maxVisible` | `number` | `5` | Max workspaces before scrolling |
| `placement` | `'sidebar-header' \| 'navbar' \| 'custom'` | `'sidebar-header'` | Where the switcher is rendered |
| `renderWorkspace` | `(workspace: Workspace) => ReactNode` | `undefined` | Custom render for workspace items |

#### `Workspace` type

```typescript
interface Workspace {
  id: string;
  name: string;
  slug?: string;
  logo?: string;        // URL or ReactNode
  role?: string;         // User's role in this workspace
  plan?: string;         // Workspace plan tier
  color?: MantineColor;  // Brand color
  memberCount?: number;
}
```

### Hooks

```typescript
function useWorkspaceSwitcher(): {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  switchTo: (id: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};
```

## Component Structure

```
<Sidebar.Header>
  <WorkspaceSwitcher
    workspaces={workspaces}
    activeWorkspace="ws-123"
    onSwitch={handleSwitch}
    onCreate={handleCreate}
  />
</Sidebar.Header>

// Renders:
// ┌────────────────────────────┐
// │ 🟦 Acme Corp          ▼   │
// ├────────────────────────────┤
// │ 🔍 Search workspaces...   │
// │ 🟦 Acme Corp     Admin ✓  │
// │ 🟩 Side Project   Owner   │
// │ 🟧 Client Work    Member  │
// ├────────────────────────────┤
// │ + Create workspace         │
// └────────────────────────────┘
```

## Behavior
- The trigger shows the active workspace logo/avatar + name
- Clicking the trigger opens a dropdown with all available workspaces
- The active workspace is indicated with a checkmark
- `searchable={true}` adds a search input at the top that filters by name
- If `onCreate` is provided, a "Create workspace" action appears at the bottom
- Switching workspaces calls `onSwitch` — the consumer handles the actual switch (page reload, context change, etc.)
- In rail mode (Spec 008), only the workspace avatar/logo is shown; the dropdown still opens on click
- Workspace avatars use the first letter of the name as fallback when no logo is provided
- The `color` prop tints the avatar background

## Accessibility
- Trigger: `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`
- Workspace list: `role="listbox"`, items are `role="option"`
- Active workspace: `aria-selected="true"`
- Search input: `aria-label="Search workspaces"`
- Keyboard: arrow keys navigate, Enter selects, Escape closes

## Dependencies
- **Spec 008** — Collapsible rail mode (compact trigger in rail)
- **Spec 012** — Scrollable with sticky zones (header slot)

## Testing Criteria
- [ ] Trigger shows active workspace name and logo
- [ ] Dropdown opens on click
- [ ] Workspaces listed with correct data
- [ ] Search filters workspaces
- [ ] Clicking workspace calls `onSwitch`
- [ ] Active workspace has checkmark
- [ ] "Create workspace" action renders when `onCreate` provided
- [ ] Rail mode shows avatar only
- [ ] Keyboard navigation works
- [ ] Storybook story with multiple workspaces

## Open Questions
- Should workspace switch trigger a full page reload or be handled in-app?
- Should the switcher support "recent workspaces" ordering?
