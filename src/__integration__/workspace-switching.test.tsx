import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavShell } from '../components/NavShell';
import { NavSidebar } from '../components/NavSidebar';
import { NavGroup } from '../components/NavGroup';
import { WorkspaceSwitcher } from '../components/SaaS/WorkspaceSwitcher';
import { sampleNavItems, sampleWorkspaces } from './helpers';

function renderWithWorkspaceSwitcher(opts: {
  onSwitch?: (ws: typeof sampleWorkspaces[0]) => void;
  searchable?: boolean;
} = {}) {
  const onSwitch = opts.onSwitch ?? vi.fn();

  return {
    onSwitch,
    ...render(
      <MantineProvider>
        <NavShell
          sidebar={
            <NavSidebar
              header={
                <WorkspaceSwitcher
                  workspaces={sampleWorkspaces}
                  activeWorkspace={sampleWorkspaces[0]}
                  onSwitch={onSwitch}
                  searchable={opts.searchable}
                />
              }
            >
              <NavGroup items={sampleNavItems} />
            </NavSidebar>
          }
        >
          <div data-testid="main">Main</div>
        </NavShell>
      </MantineProvider>,
    ),
  };
}

describe('Workspace switching integration', () => {
  it('renders active workspace name in sidebar header', () => {
    renderWithWorkspaceSwitcher();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders nav items alongside workspace switcher', () => {
    renderWithWorkspaceSwitcher();

    // Workspace switcher
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // Nav items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('opens workspace dropdown on click and sets aria-expanded', async () => {
    const user = userEvent.setup();
    renderWithWorkspaceSwitcher();

    await user.click(screen.getByText('Acme Corp'));

    // Mantine Menu renders dropdown in a portal; in jsdom the portal
    // content may not be fully rendered. Verify the trigger has expanded state.
    const trigger = screen.getByRole('button', { expanded: true });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('workspace trigger button is accessible', () => {
    renderWithWorkspaceSwitcher();

    // The trigger should have haspopup
    const trigger = screen.getByText('Acme Corp').closest('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('workspace switcher and nav items coexist in the sidebar', () => {
    renderWithWorkspaceSwitcher();

    // Workspace switcher renders
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // Nav tree is still accessible
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('workspace switcher integrates with sidebar collapse toggle', async () => {
    const user = userEvent.setup();
    renderWithWorkspaceSwitcher();

    // Both workspace switcher and collapse toggle exist
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('workspace initial letter shown as avatar fallback', () => {
    renderWithWorkspaceSwitcher();

    // "A" for "Acme Corp" first letter
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
