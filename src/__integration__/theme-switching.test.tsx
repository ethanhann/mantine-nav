import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider, createTheme } from '@mantine/core';
import { NavShell } from '../components/NavShell';
import { NavSidebar } from '../components/NavSidebar';
import { NavHeader } from '../components/NavHeader';
import { NavGroup } from '../components/NavGroup';
import { PlanBadge } from '../components/SaaS/PlanBadge';
import { NotificationIndicator } from '../components/SaaS/NotificationIndicator';
import { sampleNavItems } from './helpers';

function renderWithTheme(opts: {
  colorScheme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
} = {}) {
  const theme = createTheme({
    primaryColor: opts.primaryColor ?? 'blue',
  });

  return render(
    <MantineProvider theme={theme} defaultColorScheme={opts.colorScheme ?? 'light'}>
      <NavShell
        header={
          <NavHeader
            logo={<span data-testid="logo">Nav</span>}
            rightSection={
              <>
                <NotificationIndicator count={3} />
                <PlanBadge plan="Pro" />
              </>
            }
          />
        }
        sidebar={
          <NavSidebar>
            <NavGroup items={sampleNavItems} currentPath="/dashboard" />
          </NavSidebar>
        }
      >
        <div data-testid="main">Main Content</div>
      </NavShell>
    </MantineProvider>,
  );
}

describe('Theme switching integration', () => {
  it('renders all components in light mode', () => {
    renderWithTheme({ colorScheme: 'light' });

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications (3 unread)')).toBeInTheDocument();
  });

  it('renders all components in dark mode', () => {
    renderWithTheme({ colorScheme: 'dark' });

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications (3 unread)')).toBeInTheDocument();
  });

  it('active item renders correctly in both themes', () => {
    renderWithTheme({ colorScheme: 'light' });

    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveAttribute('data-active', 'true');
  });

  it('active item renders in dark mode', () => {
    renderWithTheme({ colorScheme: 'dark' });

    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveAttribute('data-active', 'true');
  });

  it('custom primary color propagates to components', () => {
    renderWithTheme({ primaryColor: 'teal' });

    // Components render without error with custom color
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('PlanBadge renders with role=status in themed context', () => {
    renderWithTheme();

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Pro');
  });

  it('notification indicator renders with correct count in themed context', () => {
    renderWithTheme();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications (3 unread)')).toBeInTheDocument();
  });

  it('header, sidebar, and SaaS components all render together', () => {
    renderWithTheme();

    // Header content
    expect(screen.getByTestId('logo')).toBeInTheDocument();

    // SaaS components in header
    expect(screen.getByText('Pro')).toBeInTheDocument();

    // Sidebar content
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Main content
    expect(screen.getByTestId('main')).toHaveTextContent('Main Content');
  });
});
