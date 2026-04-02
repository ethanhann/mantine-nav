# Spec 024: Feature-Flag-Aware Items

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
Show, hide, or visually modify navigation items based on feature flags or entitlements, enabling progressive rollouts and plan-gated navigation.

## Motivation
SaaS apps frequently gate features behind flags (LaunchDarkly, Unleash, custom) or plan tiers. Navigation items for unreleased or restricted features should be hidden, disabled, or shown with upgrade prompts — without requiring manual conditional rendering throughout the nav configuration.

## Mantine Foundation
- `NavLink` — Base component with `disabled` prop
- `Tooltip` — "Upgrade to access" messaging
- `Badge` — "New", "Beta", "Coming soon" labels

## API Design

### Props

#### `NavItem` additions (extends Spec 001)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `featureFlag` | `string` | `undefined` | Feature flag key; item visibility depends on flag state |
| `entitlement` | `string \| string[]` | `undefined` | Required plan/entitlement(s) to access this item |
| `whenHidden` | `'hide' \| 'disable' \| 'lock'` | `'hide'` | What to do when flag is off or entitlement not met |
| `lockMessage` | `ReactNode` | `"Upgrade to access"` | Tooltip/message shown for locked items |
| `flagBadge` | `'new' \| 'beta' \| 'coming-soon' \| ReactNode` | `undefined` | Badge shown when feature is flagged |

#### `NavGroup` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `featureFlagProvider` | `FeatureFlagProvider` | `undefined` | Custom provider for resolving flags |

#### `FeatureFlagProvider` type

```typescript
interface FeatureFlagProvider {
  isEnabled: (flag: string) => boolean;
  hasEntitlement: (entitlement: string) => boolean;
}

// Or via React context:
interface NavFeatureFlagContext {
  flags: Record<string, boolean>;
  entitlements: string[];
}
```

### Hooks

```typescript
function useNavFeatureFlags(): {
  isEnabled: (flag: string) => boolean;
  hasEntitlement: (entitlement: string) => boolean;
};

function useFilteredNavItems(
  items: NavItem[],
  provider?: FeatureFlagProvider
): NavItem[];  // Items filtered/modified based on flags
```

## Component Structure

```
<NavFeatureFlagProvider flags={flags} entitlements={userEntitlements}>
  <NavGroup items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/analytics', featureFlag: 'analytics-v2', flagBadge: 'beta' },
    { label: 'AI Assistant', href: '/ai', entitlement: 'pro', whenHidden: 'lock', lockMessage: 'Upgrade to Pro' },
    { label: 'Exports', href: '/exports', featureFlag: 'exports', whenHidden: 'hide' },
  ]} />
</NavFeatureFlagProvider>
```

## Behavior
- **`whenHidden: 'hide'`**: Item is completely removed from the nav tree
- **`whenHidden: 'disable'`**: Item is rendered but grayed out and not clickable
- **`whenHidden: 'lock'`**: Item shows a lock icon and `lockMessage` tooltip; clicking triggers upgrade flow
- `featureFlag` is resolved via the `FeatureFlagProvider` or `NavFeatureFlagContext`
- `entitlement` checks if the user's plan includes the required entitlement(s)
- `flagBadge` adds a visual label:
  - `'new'`: green "New" badge
  - `'beta'`: blue "Beta" badge
  - `'coming-soon'`: gray "Coming Soon" badge
  - Custom `ReactNode` for anything else
- `useFilteredNavItems` returns a new array with items resolved based on flags — useful for headless rendering
- If both `featureFlag` and `entitlement` are set, both must be satisfied

## Accessibility
- Disabled items: `aria-disabled="true"`, not focusable
- Locked items: focusable, with `aria-label` including the lock message
- Badges: `aria-label` with badge text (e.g., "Beta feature")

## Dependencies
- **Spec 001** — Multi-level nesting (filters operate on nav tree)

## Testing Criteria
- [ ] `whenHidden: 'hide'` removes item from DOM
- [ ] `whenHidden: 'disable'` renders grayed-out item
- [ ] `whenHidden: 'lock'` shows lock icon and tooltip
- [ ] `featureFlag` resolves via provider
- [ ] `entitlement` resolves via provider
- [ ] Both flag and entitlement must pass when both set
- [ ] `flagBadge` renders correct badge variant
- [ ] `useFilteredNavItems` returns correct array
- [ ] Custom `FeatureFlagProvider` integrates correctly
- [ ] Storybook story with various flag states

## Open Questions
- Should locked items support a click handler for upgrade modals, or just tooltips?
- Should there be a built-in adapter for common flag services (LaunchDarkly, etc.)?
