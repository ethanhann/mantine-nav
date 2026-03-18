# Spec v2 009: Storybook Setup & Stories

## Category
Developer Experience

## Status
Draft

## Summary
Properly configured Storybook with `@storybook/addon-essentials`, Mantine provider
decorators, and stories that demonstrate real Mantine-based components.

## Motivation
The v1 Storybook was missing `addon-essentials` (no controls, docs, viewport, or
backgrounds addons), and stories rendered unstyled components. v2 Storybook is a
first-class development and documentation tool.

## Mantine Foundation
- `MantineProvider` -- Theme context
- `@mantinex/storybook` -- Official Mantine Storybook helpers (if available)
- `useMantineColorScheme` -- Dark mode toggle

## Setup

### Dependencies

```json
{
  "devDependencies": {
    "@storybook/addon-essentials": "^10.x",
    "@storybook/addon-a11y": "^10.x",
    "@storybook/react": "^10.x",
    "@storybook/react-vite": "^10.x",
    "storybook": "^10.x"
  }
}
```

### .storybook/main.ts

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
};

export default config;
```

### .storybook/preview.tsx

```tsx
import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const theme = createTheme({
  // Nav-specific theme extensions if needed
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <Story />
      </MantineProvider>
    ),
  ],
};

export default preview;
```

## Story Structure

```
stories/
  _data.ts                           # Shared sample data (NO emojis, use Tabler icons)
  Shell/
    NavShell.stories.tsx              # Full shell layout
  Sidebar/
    NavSidebar.stories.tsx            # Sidebar content
    NavSidebarCollapsed.stories.tsx   # Rail mode
  Header/
    NavHeader.stories.tsx             # Header variants
    NavHeaderTabs.stories.tsx         # Tab navigation
  NavGroup/
    NavGroup.stories.tsx              # Basic navigation
    NavGroupNested.stories.tsx        # Multi-level nesting
    NavGroupAccordion.stories.tsx     # Accordion mode
    NavGroupCollapsed.stories.tsx     # Rail mode rendering
  SaaS/
    WorkspaceSwitcher.stories.tsx
    UserMenu.stories.tsx
    NotificationIndicator.stories.tsx
    PlanBadge.stories.tsx
  Recipes/
    AdminDashboard.stories.tsx        # Complete admin layout
    SaasPlatform.stories.tsx          # Full SaaS layout
    Documentation.stories.tsx         # Docs site layout
```

## Story Conventions

1. Every story uses `tags: ['autodocs']` for auto-generated docs
2. All interactive props exposed via `argTypes`
3. Sample data uses `@tabler/icons-react` icons, never emojis
4. Recipe stories show complete, realistic layouts
5. Each component has a `Default` story at minimum
6. Dark mode testable via Mantine's built-in color scheme toggle

## Sample Data (_data.ts)

```typescript
import {
  IconHome, IconSettings, IconUsers, IconFileText,
  IconChartBar, IconBell, IconSearch,
} from '@tabler/icons-react';

export const sampleItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: <IconHome size={18} /> },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: <IconChartBar size={18} /> },
  {
    id: 'settings',
    label: 'Settings',
    icon: <IconSettings size={18} />,
    children: [
      { id: 'general', label: 'General', href: '/settings/general' },
      { id: 'team', label: 'Team', href: '/settings/team' },
    ],
  },
];

export const sampleUser: UserInfo = {
  name: 'Jane Cooper',
  email: 'jane@acme.com',
  role: 'Admin',
};

export const sampleWorkspaces: Workspace[] = [
  { id: '1', name: 'Acme Corp', role: 'Admin', plan: 'Pro', color: 'blue' },
  { id: '2', name: 'Side Project', role: 'Owner', color: 'green' },
  { id: '3', name: 'Client Work', role: 'Member', color: 'orange' },
];
```

## Testing Criteria
- [ ] `storybook build` completes without errors
- [ ] Autodocs generate for all components
- [ ] Controls work for all props
- [ ] Dark mode toggle works
- [ ] a11y addon reports no violations
- [ ] All recipe stories render complete layouts
- [ ] No emoji characters in any story

## Dependencies
- All other v2 specs
