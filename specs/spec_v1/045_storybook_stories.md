# Spec 045: Storybook Stories

## Category
Developer Experience

## Status
Draft

## Summary
Comprehensive Storybook stories for every component and variant, serving as interactive documentation, visual regression test targets, and development playground.

## Motivation
Storybook is the industry standard for component documentation and testing. Complete story coverage ensures that every feature is documented with interactive examples, enables visual regression testing, and provides a sandbox for development and review.

## Mantine Foundation
- `@storybook/react` — Storybook for React
- `storybook-addon-mantine` — Mantine theming integration
- Mantine's own Storybook patterns

## API Design

### Story structure

```
stories/
├── Sidebar/
│   ├── Sidebar.stories.tsx           # Core sidebar
│   ├── SidebarRail.stories.tsx       # Rail mode variants
│   ├── SidebarMini.stories.tsx       # Mini variant
│   ├── SidebarResize.stories.tsx     # Resizable
│   └── SidebarSections.stories.tsx   # Sections & dividers
├── NavBar/
│   ├── NavBar.stories.tsx            # Core navbar
│   ├── MegaMenu.stories.tsx          # Mega menu dropdowns
│   ├── TabNav.stories.tsx            # Tab-style variant
│   └── Breadcrumbs.stories.tsx       # Breadcrumb bar
├── Layout/
│   ├── NavLayout.stories.tsx         # Combined layout
│   ├── Responsive.stories.tsx        # Responsive behavior
│   └── PrintFriendly.stories.tsx     # Print mode
├── SaaS/
│   ├── WorkspaceSwitcher.stories.tsx  # Org switcher
│   ├── UserMenu.stories.tsx          # User avatar + menu
│   ├── PlanBadge.stories.tsx         # Plan tier
│   └── NotificationBell.stories.tsx  # Notifications
├── Dashboard/
│   ├── DashboardSwitcher.stories.tsx # Dashboard switching
│   ├── FilterPanel.stories.tsx       # Filter panel
│   └── RecentlyViewed.stories.tsx    # Recent pages
├── Theming/
│   ├── Presets.stories.tsx           # Theme presets
│   ├── ColorSchemes.stories.tsx      # Custom colors
│   ├── DarkMode.stories.tsx          # Light/dark mode
│   └── RTL.stories.tsx              # RTL support
└── Recipes/
    ├── AdminDashboard.stories.tsx    # Full admin layout
    ├── SaasPlatform.stories.tsx      # SaaS platform layout
    ├── AnalyticsDashboard.stories.tsx # Analytics layout
    └── Documentation.stories.tsx     # Documentation site layout
```

### Story conventions

```typescript
// Every story file follows this pattern:
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '@nav/core';

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    collapsible: { control: 'boolean' },
    variant: { control: 'select', options: ['full', 'mini', 'rail'] },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = { args: { /* ... */ } };
export const Collapsed: Story = { args: { collapsed: true } };
export const WithSections: Story = { /* ... */ };
```

### Props for story components (not part of the library)

| Prop | Type | Description |
|------|------|-------------|
| All component props | — | Exposed as Storybook controls |

## Behavior
- Every public component has at least a `Default` story
- Every significant variant has its own story
- Interactive controls allow real-time prop manipulation
- "Recipes" stories show complete, realistic layouts
- Stories use `tags: ['autodocs']` for automatic documentation generation
- Dark mode toggle available in Storybook toolbar
- Responsive viewport presets (mobile, tablet, desktop) in toolbar
- RTL toggle in toolbar
- Stories serve as visual regression test targets (Chromatic, Percy, or similar)

## Story categories
1. **Component stories** — Individual component variants
2. **Feature stories** — Cross-component feature demos (e.g., keyboard navigation)
3. **Recipe stories** — Complete layout examples (admin panel, SaaS dashboard)
4. **Interaction stories** — Playwright-based interaction tests

## Accessibility
- All stories pass axe-core accessibility audit
- Storybook a11y addon enabled for every story
- Keyboard navigation testable in stories

## Dependencies
- All other specs — stories cover every feature

## Testing Criteria
- [ ] Every public component has a Default story
- [ ] Every variant has a story
- [ ] Controls work for all props
- [ ] Dark mode toggle works
- [ ] Responsive viewports work
- [ ] RTL toggle works
- [ ] Autodocs generate for all components
- [ ] Recipe stories render complete layouts
- [ ] axe-core passes on all stories
- [ ] Storybook builds without errors

## Open Questions
- Should we use Chromatic for visual regression testing?
- Should stories include code snippets showing how to achieve the displayed configuration?
