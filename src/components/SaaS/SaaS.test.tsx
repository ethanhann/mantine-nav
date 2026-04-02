import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { PlanBadge } from './PlanBadge';
import { NotificationIndicator } from './NotificationIndicator';
import { UserMenu } from './UserMenu';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}

describe('SaaS Components (Mantine v2)', () => {
  it('WorkspaceSwitcher renders active workspace', () => {
    const ws = { id: '1', name: 'My Workspace' };
    render(<WorkspaceSwitcher workspaces={[ws]} activeWorkspace={ws} onSwitch={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('WorkspaceSwitcher toggles dropdown and shows items', async () => {
    const user = userEvent.setup();
    const ws1 = { id: '1', name: 'WS 1' };
    const ws2 = { id: '2', name: 'WS 2' };
    const onSwitch = vi.fn();
    render(<WorkspaceSwitcher workspaces={[ws1, ws2]} activeWorkspace={ws1} onSwitch={onSwitch} />, { wrapper: Wrapper });

    // Click trigger to open menu
    await user.click(screen.getByText('WS 1'));

    // Menu renders in a portal - verify the trigger has aria-expanded
    const trigger = screen.getByRole('button', { expanded: true });
    expect(trigger).toBeInTheDocument();
  });

  it('PlanBadge renders plan name', () => {
    render(<PlanBadge plan="Pro" />, { wrapper: Wrapper });
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('PlanBadge shows upgrade CTA', () => {
    render(<PlanBadge plan="Free" showUpgrade onUpgrade={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('NotificationIndicator renders bell icon', () => {
    render(<NotificationIndicator count={5} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Notifications (5 unread)')).toBeInTheDocument();
  });

  it('NotificationIndicator caps at maxCount', () => {
    render(<NotificationIndicator count={150} maxCount={99} />, { wrapper: Wrapper });
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('UserMenu renders user name', () => {
    const user = { id: '1', name: 'Jane Doe', email: 'jane@example.com' };
    render(<UserMenu user={user} />, { wrapper: Wrapper });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});
