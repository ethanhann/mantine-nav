# Spec v3 006: API Ergonomics Review -- Consumer Feedback & Polish

## Category
Developer Experience

## Status
Draft

## Summary
Conduct a structured review of the public API surface, gather feedback from
internal consumers, and polish prop naming, defaults, documentation, and
TypeScript types before a stable 1.0 release.

## Motivation
The v2 retrospective identified "Gather feedback from consumers on API
ergonomics" as a next step. The v2 rebuild established the component API
but it was designed top-down from specs. Real consumer usage will reveal
friction points, confusing defaults, missing convenience props, and
documentation gaps.

## API Surface Audit

### Current Exported API

The library exports the following public surface (from `src/index.ts`):

**Components (9):**
`NavShell`, `NavSidebar`, `NavHeader`, `NavGroup`, `WorkspaceSwitcher`,
`UserMenu`, `PlanBadge`, `NotificationIndicator`

**Hooks (16):**
`useNavShell`, `useNavItems`, `useActiveNavItem`, `useCurrentPath`,
`useNavAnimation`, `useNavVars`, `useNavKeyboard`, `useNavColorScheme`,
`useReorderableNav`, `usePinnedItems`, `useSidebarResize`,
`useSidebarVariant`, `useResponsiveNav`, `useRecentlyViewed`,
`useStarredPages`, `useHeadlessSidebar`, `useIsSSR`, `useHydrated`

**Types (30+):**
All component prop types and hook return types are exported.

### Audit Checklist

For each exported item, review:

| Check | Description |
|-------|-------------|
| Naming | Is the name clear and consistent with Mantine conventions? |
| Props | Are required/optional props correct? Are defaults sensible? |
| Types | Are types specific enough? Any unnecessary `any` or `unknown`? |
| Docs | Does JSDoc describe purpose, params, and return value? |
| Examples | Is there a Storybook story demonstrating typical usage? |
| Composition | Does it compose well with other library components? |
| Mantine compat | Does it accept standard Mantine props (`className`, `style`, `classNames`)? |

### Specific Areas to Review

#### 1. Prop Naming Consistency

Ensure consistent naming patterns across all components:

```typescript
// Pattern: on[Event] for callbacks
onItemClick     // not onClick, handleClick
onGroupToggle   // not onToggle, toggleGroup
onWorkspaceChange // not onSwitch, switchWorkspace

// Pattern: [noun] for data props
items           // not navItems, data
currentPath     // not path, activePath
workspaces      // not options, data

// Pattern: [adjective] for boolean props
collapsed       // not isCollapsed, collapse
accordion       // not isAccordion, useAccordion
disabled        // not isDisabled
```

#### 2. Required vs Optional Props

Review whether required props are truly necessary:

```typescript
// Should `items` be required or default to []?
// Should `currentPath` be required or auto-detected from window.location?
// Should `user` in UserMenu be required or show a placeholder?
```

#### 3. Hook API Consistency

All hooks should follow a consistent pattern:

```typescript
// Input: options object (not positional args)
const result = useNavItems({ items, expanded: true });

// Return: named object (not tuple)
const { flatItems, expandedKeys, toggleGroup } = useNavItems(options);

// Not:
const [flatItems, expandedKeys, toggleGroup] = useNavItems(items, true);
```

#### 4. Missing Convenience Features

Identify gaps based on common consumer patterns:

- Does `NavGroup` support a `renderItem` prop for custom rendering?
- Does `NavShell` accept `padding` or `maxWidth` for main content?
- Can `WorkspaceSwitcher` show a "Create workspace" action?
- Does `UserMenu` support a footer section for sign-out?
- Can `NotificationIndicator` show a "Mark all as read" action?

## Consumer Feedback Plan

### Internal Dogfooding

1. **Identify 2-3 internal projects** that can adopt `@ethanhann/nav@beta`
2. **Time-box integration** to 1 day per project
3. **Document friction points** in a shared feedback document

### Feedback Template

For each integration attempt, document:

```markdown
## Project: [Name]
## Developer: [Name]
## Date: [Date]

### Setup
- Time to install and configure: ___
- Blockers during setup: ___

### Integration
- Components used: ___
- Time to build basic layout: ___
- Time to customize styling: ___

### Pain Points
1. [Description of friction]
   - Expected: [what they expected]
   - Actual: [what happened]
   - Severity: [blocking / annoying / minor]

### Missing Features
1. [Feature they needed but didn't exist]

### Positive Feedback
1. [What worked well]

### API Suggestions
1. [Specific prop/hook changes they'd recommend]
```

## Documentation Improvements

### JSDoc Coverage

Every exported function, component, and type should have JSDoc:

```typescript
/**
 * Renders a tree of navigation items using Mantine NavLink.
 *
 * Handles multi-level nesting, active state detection, accordion behavior,
 * and adapts to sidebar collapsed state automatically.
 *
 * @example
 * ```tsx
 * <NavGroup
 *   items={navItems}
 *   currentPath="/settings/general"
 *   accordion
 * />
 * ```
 *
 * @see {@link NavItem} for the item type definition
 * @see {@link useNavItems} for programmatic item manipulation
 */
export function NavGroup(props: NavGroupProps): ReactElement;
```

### Storybook Autodocs

Verify that Storybook `autodocs` generates complete documentation:

- All prop types displayed with descriptions
- Default values shown
- Interactive controls work for all props
- Code examples in docs tab

### README Recipes

Add quick-start recipes to README:

```markdown
## Quick Start

### Basic Sidebar Layout
### SaaS Dashboard
### Documentation Site
```

## Breaking Change Policy

For pre-1.0 releases:

1. **Minor versions** (0.x.0) may contain breaking changes
2. Breaking changes are documented in release notes
3. Codemods are provided for automated migration (Spec v3 002)
4. Deprecation warnings are added at least one minor version before removal

For post-1.0:

1. **Major versions** (x.0.0) contain breaking changes
2. **Minor versions** (0.x.0) are backward compatible
3. Deprecated APIs remain for one major version cycle

## Dependencies
- **Spec v3 002** -- Migration codemods (API changes should have codemods)
- **Spec v3 005** -- Pre-release publishing (consumers need installable packages
  to provide feedback)

## Testing Criteria
- [ ] API audit checklist completed for all exported items
- [ ] JSDoc added to all exported functions, components, and types
- [ ] Storybook autodocs complete for all components
- [ ] At least 2 internal projects attempt integration
- [ ] Feedback collected using the template above
- [ ] Breaking change policy documented in README
- [ ] Prop naming inconsistencies resolved
- [ ] No unnecessary `any` types in public API
- [ ] README includes quick-start recipes

## Open Questions
- Should we publish a dedicated documentation site (e.g., Docusaurus) or is
  Storybook autodocs sufficient for pre-1.0?
- How do we handle feedback that conflicts with Mantine conventions?
  (e.g., a consumer wants `onChange` but Mantine uses `onXxxChange`)
- Should we run a formal API review meeting, or is async feedback sufficient?
- At what point do we promote from 0.x to 1.0? What is the 1.0 criteria?
