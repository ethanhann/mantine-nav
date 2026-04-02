# Spec v2 005: WorkspaceSwitcher

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A dropdown component for switching between workspaces/organizations, built on
Mantine's `Menu`, `Avatar`, `Group`, and `Text` components.

## Motivation
Multi-tenant SaaS apps need workspace switching (Slack, Notion, Linear pattern).
The v1 implementation used raw `<button>` and `<div>` elements with no styling.
v2 uses Mantine's `Menu` for a properly styled, accessible, keyboard-navigable dropdown.

## Mantine Foundation
- `Menu` + `Menu.Target` + `Menu.Dropdown` + `Menu.Item` + `Menu.Label` + `Menu.Divider` -- Dropdown
- `Avatar` -- Workspace logo/initials
- `Group` -- Horizontal layout
- `Text` -- Labels and descriptions
- `TextInput` -- Search (if searchable)
- `ScrollArea` -- Scrollable workspace list
- `UnstyledButton` -- Trigger button
- `useDisclosure` -- Dropdown state

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workspaces` | `Workspace[]` | `[]` | Available workspaces |
| `activeWorkspace` | `Workspace` | -- | Currently active workspace |
| `onSwitch` | `(workspace: Workspace) => void` | -- | Switch callback |
| `onCreate` | `() => void` | `undefined` | "Create workspace" action |
| `searchable` | `boolean` | `false` | Enable search filtering |
| `maxVisible` | `number` | `5` | Max items before scroll |

### Workspace Type

```typescript
interface Workspace {
  id: string;
  name: string;
  logo?: string;          // URL
  role?: string;
  plan?: string;
  color?: MantineColor;
}
```

## Component Structure

```tsx
<WorkspaceSwitcher
  workspaces={workspaces}
  activeWorkspace={active}
  onSwitch={handleSwitch}
  onCreate={handleCreate}
  searchable
/>

// Renders:
<Menu width={280} position="bottom-start" withinPortal>
  <Menu.Target>
    <UnstyledButton p="xs" style={{ width: '100%' }}>
      <Group gap="sm" wrap="nowrap">
        <Avatar src={active.logo} color={active.color} size="sm" radius="sm">
          {active.name.charAt(0)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} truncate>{active.name}</Text>
          {active.plan && <Text size="xs" c="dimmed">{active.plan}</Text>}
        </div>
        <IconSelector size={14} />
      </Group>
    </UnstyledButton>
  </Menu.Target>

  <Menu.Dropdown>
    {searchable && (
      <TextInput
        placeholder="Search workspaces..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={...}
        mb="xs"
      />
    )}
    <ScrollArea.Autosize mah={maxVisible * 44}>
      {filtered.map(ws => (
        <Menu.Item
          key={ws.id}
          leftSection={
            <Avatar src={ws.logo} color={ws.color} size="sm" radius="sm">
              {ws.name.charAt(0)}
            </Avatar>
          }
          rightSection={ws.id === active.id ? <IconCheck size={14} /> : null}
          onClick={() => onSwitch(ws)}
        >
          <Text size="sm">{ws.name}</Text>
          {ws.role && <Text size="xs" c="dimmed">{ws.role}</Text>}
        </Menu.Item>
      ))}
    </ScrollArea.Autosize>
    {onCreate && (
      <>
        <Menu.Divider />
        <Menu.Item leftSection={<IconPlus size={14} />} onClick={onCreate}>
          Create workspace
        </Menu.Item>
      </>
    )}
  </Menu.Dropdown>
</Menu>
```

## Behavior
- Trigger shows active workspace avatar + name + plan
- Click opens Menu dropdown
- Active workspace shown with checkmark
- Search filters by name (case-insensitive)
- Scrollable when list exceeds `maxVisible`
- "Create workspace" at bottom when `onCreate` provided
- In collapsed/rail mode: trigger shows only avatar, dropdown still opens normally
- Keyboard: arrow keys navigate, Enter selects, Escape closes

## Accessibility
- Menu.Target: `aria-haspopup="menu"`, `aria-expanded`
- Menu items: `role="menuitem"`
- Active workspace: visually indicated with checkmark
- Search input: `aria-label="Search workspaces"`
- Focus trap within dropdown

## Dependencies
- **Spec v2 001** -- NavShell (`useNavShell()` for collapsed state)
- **Spec v2 002** -- NavSidebar (rendered in sidebar header)

## Testing Criteria
- [ ] Trigger shows active workspace info
- [ ] Dropdown opens on click with all workspaces
- [ ] Search filters workspaces
- [ ] Clicking workspace calls `onSwitch`
- [ ] Active workspace has checkmark
- [ ] "Create workspace" renders when `onCreate` provided
- [ ] Collapsed mode shows avatar only
- [ ] Keyboard navigation works
- [ ] Storybook story

## Open Questions
- Should workspace list support grouping (e.g., by org)?
