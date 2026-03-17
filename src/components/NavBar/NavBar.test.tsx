import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavBar, NavBreadcrumbs, EnvironmentIndicator, CommandPaletteSlot } from './NavBar';

describe('Phase 4: NavBar Components', () => {
  it('NavBar renders logo, children, and right section', () => {
    render(
      <NavBar logo={<span>Logo</span>} rightSection={<button>User</button>}>
        <a href="/">Home</a>
      </NavBar>,
    );
    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('NavBar has banner role', () => {
    render(<NavBar>Content</NavBar>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('NavBreadcrumbs renders items with separator', () => {
    render(
      <NavBreadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Settings', href: '/settings' },
        { label: 'Profile' },
      ]} />,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('NavBreadcrumbs marks last item as current page', () => {
    render(
      <NavBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />,
    );
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
  });

  it('EnvironmentIndicator renders badge variant', () => {
    render(<EnvironmentIndicator environment="Staging" color="#f59e0b" />);
    expect(screen.getByText('Staging')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('CommandPaletteSlot renders with shortcut', async () => {
    const user = userEvent.setup();
    const onTrigger = vi.fn();
    render(<CommandPaletteSlot onTrigger={onTrigger} />);
    await user.click(screen.getByLabelText('Search... (⌘K)'));
    expect(onTrigger).toHaveBeenCalled();
  });
});
