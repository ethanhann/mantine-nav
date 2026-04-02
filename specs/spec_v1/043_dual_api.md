# Spec 043: Dual API

## Category
Developer Experience

## Status
Draft

## Summary
Support two complementary ways to define navigation: a declarative JSON/object configuration API and a JSX composition API, letting developers choose the approach that fits their use case.

## Motivation
Some developers prefer a data-driven approach (pass a config object), especially when navigation is generated from a CMS or API. Others prefer JSX composition for maximum flexibility and IDE autocompletion. Supporting both maximizes adoption without compromising either experience.

## Mantine Foundation
- React component composition (JSX API)
- Props-based configuration (object API)

## API Design

### Object/Config API

```typescript
interface NavConfig {
  sidebar?: {
    items: NavItem[];
    collapsible?: boolean;
    header?: ReactNode;
    footer?: ReactNode;
    // ... all sidebar props
  };
  navbar?: {
    items: NavBarItem[];
    logo?: ReactNode;
    rightSection?: ReactNode;
    // ... all navbar props
  };
  layout?: {
    sidebarBreakpoint?: MantineBreakpoint;
    navbarBreakpoint?: MantineBreakpoint;
    // ... all layout props
  };
}

// Usage:
<Nav config={navConfig} />
```

### JSX Composition API

```tsx
// Usage:
<NavLayout>
  <NavBar>
    <NavBar.Logo>...</NavBar.Logo>
    <NavBar.Links>
      <NavBarLink label="Home" href="/" />
      <NavBarLink label="Products" megaMenu={columns} />
    </NavBar.Links>
    <NavBar.RightSection>...</NavBar.RightSection>
  </NavBar>
  <Sidebar collapsible>
    <Sidebar.Header>...</Sidebar.Header>
    <Sidebar.Content>
      <NavSection label="Main">
        <NavLink icon={<Icon />} label="Dashboard" href="/" />
        <NavGroup label="Settings">
          <NavLink label="General" href="/settings/general" />
          <NavLink label="Team" href="/settings/team" />
        </NavGroup>
      </NavSection>
    </Sidebar.Content>
    <Sidebar.Footer>...</Sidebar.Footer>
  </Sidebar>
  <NavLayout.Main>
    {children}
  </NavLayout.Main>
</NavLayout>
```

### Props

#### `Nav` component (config API entry point)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `NavConfig` | — | Full navigation configuration |
| `onConfigChange` | `(config: NavConfig) => void` | `undefined` | Callback for config-driven state changes |
| `children` | `ReactNode` | — | Main content |

### Hooks

```typescript
function useNavConfig(): NavConfig;   // Read current nav configuration
function useNavFromConfig(config: NavConfig): ReactNode;  // Convert config to JSX
```

## Component Structure

The config API internally converts to the JSX API:

```
<Nav config={config}>           // Config wrapper
  <NavLayout>                   // Generated from config
    <NavBar ... />              // Generated from config.navbar
    <Sidebar ... />             // Generated from config.sidebar
    <NavLayout.Main>
      {children}
    </NavLayout.Main>
  </NavLayout>
</Nav>
```

## Behavior
- The config API is a convenience wrapper that generates the same component tree as the JSX API
- All features available in JSX are available in config (they produce identical output)
- `ReactNode` values in config (icons, custom renderers) are passed through as-is
- The config API supports partial updates — only changed properties cause re-renders
- Both APIs can be mixed: use config for the structure, JSX for custom slots
- `useNavFromConfig` is available for advanced use cases (e.g., generating navigation in a headless context)
- TypeScript provides full autocompletion and type safety for both APIs

## Accessibility
- Both APIs produce identical DOM and ARIA attributes
- No accessibility differences between config and JSX modes

## Dependencies
- All other specs — this is an API layer over the full component library

## Testing Criteria
- [ ] Config API produces same visual output as equivalent JSX
- [ ] Config API supports all sidebar features
- [ ] Config API supports all navbar features
- [ ] TypeScript autocompletion works for config object
- [ ] Partial config updates work
- [ ] Mixed config + JSX works
- [ ] `useNavFromConfig` produces correct React elements
- [ ] Storybook story with both API approaches side-by-side

## Open Questions
- Should the config API support lazy-loaded items (functions that return items)?
- Should there be a config migration tool for updating between major versions?
