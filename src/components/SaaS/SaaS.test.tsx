import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { PlanBadge } from './PlanBadge';
import { NotificationBell } from './NotificationBell';
import { OnboardingProgress } from './OnboardingProgress';
import { NavFeatureFlagProvider, FeatureGate } from './FeatureFlagProvider';
import { InviteTeamCTA } from './InviteTeamCTA';

describe('Phase 6: SaaS Components', () => {
  it('WorkspaceSwitcher renders active workspace', () => {
    const ws = { id: '1', name: 'My Workspace' };
    render(<WorkspaceSwitcher workspaces={[ws]} activeWorkspace={ws} onSwitch={() => {}} />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('WorkspaceSwitcher toggles dropdown', async () => {
    const user = userEvent.setup();
    const ws1 = { id: '1', name: 'WS 1' };
    const ws2 = { id: '2', name: 'WS 2' };
    const onSwitch = vi.fn();
    render(<WorkspaceSwitcher workspaces={[ws1, ws2]} activeWorkspace={ws1} onSwitch={onSwitch} />);

    await user.click(screen.getByText('WS 1'));
    expect(screen.getByText('WS 2')).toBeInTheDocument();

    await user.click(screen.getByText('WS 2'));
    expect(onSwitch).toHaveBeenCalledWith(ws2);
  });

  it('PlanBadge renders plan name', () => {
    render(<PlanBadge plan="Pro" />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('PlanBadge shows upgrade CTA', () => {
    render(<PlanBadge plan="Free" showUpgrade onUpgrade={() => {}} />);
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('NotificationBell shows count', () => {
    render(<NotificationBell count={5} />);
    expect(screen.getByLabelText('Notifications (5 unread)')).toBeInTheDocument();
  });

  it('NotificationBell caps at maxCount', () => {
    render(<NotificationBell count={150} maxCount={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('OnboardingProgress shows progress', () => {
    const steps = [
      { id: '1', label: 'Step 1', completed: true },
      { id: '2', label: 'Step 2', completed: false },
      { id: '3', label: 'Step 3', completed: false },
    ];
    render(<OnboardingProgress steps={steps} />);
    expect(screen.getByText('1 of 3 complete')).toBeInTheDocument();
  });

  it('FeatureGate hides content when flag is disabled', () => {
    render(
      <NavFeatureFlagProvider flags={{ beta: false }}>
        <FeatureGate flag="beta">
          <div>Beta Feature</div>
        </FeatureGate>
      </NavFeatureFlagProvider>,
    );
    expect(screen.queryByText('Beta Feature')).not.toBeInTheDocument();
  });

  it('FeatureGate shows content when flag is enabled', () => {
    render(
      <NavFeatureFlagProvider flags={{ beta: true }}>
        <FeatureGate flag="beta">
          <div>Beta Feature</div>
        </FeatureGate>
      </NavFeatureFlagProvider>,
    );
    expect(screen.getByText('Beta Feature')).toBeInTheDocument();
  });

  it('InviteTeamCTA renders and is clickable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<InviteTeamCTA onClick={onClick} />);
    await user.click(screen.getByText('Invite teammates'));
    expect(onClick).toHaveBeenCalled();
  });
});
