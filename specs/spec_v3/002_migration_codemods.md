# Spec v3 002: Automated v1-to-v2 Codemods -- Migration Tooling

## Category
Implementation

## Status
Draft

## Summary
Build jscodeshift-based codemods that automate the migration from v1 (`@ethanhann/mantine-nav`)
API to v2. Provide adapter components for cases where automated transforms are
insufficient.

## Motivation
The v2 retrospective identified the "V1 to V2 migration gap" as an improvement area:
"The migration plan (spec v2 010) exists but no automated codemods or adapter
components were built. Consumers upgrading from v1 will need manual migration effort."

Codemods reduce migration friction, prevent human error in large codebases, and
demonstrate that the library team takes backward compatibility seriously.

## Scope

### What Codemods Cover

Based on the v1-to-v2 replacement table in Spec v2 000:

| v1 Import | v2 Replacement | Codemod Transform |
|-----------|---------------|-------------------|
| `Sidebar` | `NavSidebar` | Rename import + component usage |
| `NavBar` | `NavHeader` | Rename import + component usage |
| `NavLayout` | `NavShell` | Rename import + component usage + prop mapping |
| `NavSection` | `AppShell.Section` | Rewrite to Mantine direct usage |
| `NavBreadcrumbs` | `Breadcrumbs` (Mantine) | Rewrite import source to `@mantine/core` |
| `EnvironmentIndicator` | `Badge` (Mantine) | Rewrite to Mantine `Badge` with color prop |
| `CommandPaletteSlot` | `Spotlight` | Rewrite import to `@mantine/spotlight` |
| `DashboardSwitcher` | `Menu` composite | Manual (provide adapter) |
| `FilterPanel` | `AppShell.Aside` | Manual (provide adapter) |
| `NavThemeProvider` | `createTheme()` | Rewrite to Mantine theme extension |
| `NavProvider` | `NavShell` (context built-in) | Remove wrapping provider |

### Prop Mapping Transforms

```typescript
// v1: NavLayout props
<NavLayout sidebar={<Sidebar />} header={<NavBar />}>

// v2: NavShell props
<NavShell>
  <NavHeader />
  <NavSidebar />
  <AppShell.Main>{children}</AppShell.Main>
</NavShell>
```

```typescript
// v1: NavBar with breadcrumbs
<NavBar breadcrumbs={[{ label: 'Home', href: '/' }]} />

// v2: NavHeader (breadcrumbs are now separate)
<NavHeader>
  <Breadcrumbs>{...}</Breadcrumbs>
</NavHeader>
```

## Architecture

### Codemod Package

```
packages/codemods/
  src/
    transforms/
      rename-sidebar.ts          # Sidebar -> NavSidebar
      rename-navbar.ts           # NavBar -> NavHeader
      rename-nav-layout.ts       # NavLayout -> NavShell + restructure
      remove-nav-provider.ts     # Unwrap NavProvider, use NavShell context
      replace-nav-section.ts     # NavSection -> AppShell.Section
      replace-breadcrumbs.ts     # NavBreadcrumbs -> Mantine Breadcrumbs
      replace-env-indicator.ts   # EnvironmentIndicator -> Mantine Badge
      migrate-theme-provider.ts  # NavThemeProvider -> createTheme()
      update-nav-item-types.ts   # NavItemType union -> NavItem interface
    adapters/
      DashboardSwitcherAdapter.tsx   # Wraps v2 Menu to match v1 API
      FilterPanelAdapter.tsx         # Wraps v2 AppShell.Aside to match v1 API
    index.ts                     # CLI entry point
    utils.ts                     # Shared AST helpers
  __tests__/
    __testfixtures__/            # Input/output fixture pairs per transform
    rename-sidebar.test.ts
    rename-navbar.test.ts
    ...
  package.json
  tsconfig.json
  README.md
```

### CLI Runner

```bash
# Run all codemods
npx @ethanhann/mantine-nav-codemods --path ./src

# Run specific transform
npx @ethanhann/mantine-nav-codemods --transform rename-sidebar --path ./src

# Dry run
npx @ethanhann/mantine-nav-codemods --path ./src --dry

# Print transforms that would apply
npx @ethanhann/mantine-nav-codemods --path ./src --list
```

### Transform Implementation Pattern

Each transform uses the jscodeshift API:

```typescript
import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find imports from @ethanhann/mantine-nav
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/mantine-nav' },
    })
    .forEach((path) => {
      // Rename specific import specifiers
      path.node.specifiers?.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'Sidebar'
        ) {
          specifier.imported.name = 'NavSidebar';
          if (specifier.local?.name === 'Sidebar') {
            specifier.local.name = 'NavSidebar';
          }
        }
      });
    });

  // Rename JSX usage
  root
    .find(j.JSXIdentifier, { name: 'Sidebar' })
    .forEach((path) => {
      path.node.name = 'NavSidebar';
    });

  return root.toSource();
}
```

## Adapter Components

For complex transforms that can't be automated (structural changes), provide
thin adapter components that map the v1 API to v2 internals:

```tsx
// DashboardSwitcherAdapter.tsx
// Maps v1 DashboardSwitcher props to v2 Menu composition
import { Menu, Group, Text, UnstyledButton } from '@mantine/core';

interface LegacyDashboardSwitcherProps {
  dashboards: Array<{ id: string; name: string; icon?: ReactNode }>;
  activeDashboard: string;
  onSwitch: (id: string) => void;
}

/** @deprecated Use Menu composition directly. See migration guide. */
export function DashboardSwitcherAdapter({
  dashboards,
  activeDashboard,
  onSwitch,
}: LegacyDashboardSwitcherProps) {
  const active = dashboards.find((d) => d.id === activeDashboard);
  return (
    <Menu>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            {active?.icon}
            <Text size="sm">{active?.name}</Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {dashboards.map((d) => (
          <Menu.Item
            key={d.id}
            leftSection={d.icon}
            onClick={() => onSwitch(d.id)}
          >
            {d.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
```

## Testing Strategy

Each transform has a test with input/output fixture pairs:

```
__testfixtures__/
  rename-sidebar.input.tsx    # v1 code
  rename-sidebar.output.tsx   # Expected v2 code
```

Tests use `jscodeshift/testUtils`:

```typescript
import { defineTest } from 'jscodeshift/src/testUtils';
defineTest(__dirname, 'rename-sidebar', null, 'rename-sidebar');
```

## Dependencies
- **Spec v3 001** -- CSS consolidation (codemods should target the final API surface
  after inline styles are removed)
- **Spec v2 000** -- Architecture (v1-to-v2 replacement table)
- **Spec v2 010** -- Migration plan (expanded here with automation)

## Testing Criteria
- [ ] Each transform has input/output fixture tests
- [ ] All transforms pass on fixture pairs
- [ ] CLI `--dry` mode prints changes without modifying files
- [ ] CLI `--list` mode prints applicable transforms
- [ ] Adapter components render correctly in Storybook
- [ ] Adapter components have deprecation JSDoc warnings
- [ ] Running all codemods on a sample v1 consumer project produces valid v2 code
- [ ] README documents all available transforms with before/after examples

## Open Questions
- Should the codemods package be published separately (`@ethanhann/mantine-nav-codemods`)
  or bundled in the main package under `@ethanhann/mantine-nav/codemods`?
- Should adapter components live in the main package or the codemods package?
- How do we handle consumers who have customized v1 components with wrapper HOCs?
