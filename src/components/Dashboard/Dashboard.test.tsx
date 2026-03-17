import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { DashboardSwitcher } from './DashboardSwitcher';
import { FilterIndicator } from './FilterIndicator';
import { LiveDataStatus } from './LiveDataStatus';
import { FilterPanel } from './FilterPanel';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Phase 7: Dashboard Components', () => {
  it('DashboardSwitcher renders active dashboard', () => {
    const d = { id: '1', name: 'Sales Dashboard' };
    render(<DashboardSwitcher dashboards={[d]} activeDashboard={d} onSwitch={() => {}} />);
    expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
  });

  it('DashboardSwitcher toggles dropdown', async () => {
    const user = userEvent.setup();
    const d1 = { id: '1', name: 'Sales' };
    const d2 = { id: '2', name: 'Marketing' };
    const onSwitch = vi.fn();
    render(<DashboardSwitcher dashboards={[d1, d2]} activeDashboard={d1} onSwitch={onSwitch} />);

    await user.click(screen.getByText('Sales'));
    await user.click(screen.getByText('Marketing'));
    expect(onSwitch).toHaveBeenCalledWith(d2);
  });

  it('FilterIndicator shows active filters', () => {
    render(
      <FilterIndicator
        filters={[{ key: 'status', label: 'Status', value: 'Active' }]}
      />,
    );
    expect(screen.getByText(/Status/)).toBeInTheDocument();
    expect(screen.getByText(/Active/)).toBeInTheDocument();
  });

  it('LiveDataStatus renders dot variant', () => {
    render(<LiveDataStatus status="connected" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('LiveDataStatus renders badge variant', () => {
    render(<LiveDataStatus status="error" variant="badge" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('FilterPanel toggles open/closed', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <FilterPanel>
        <div>Filter content</div>
      </FilterPanel>,
    );
    expect(screen.getByText('Filter content')).toBeInTheDocument();
    const toggle = screen.getByText(/Filters/);
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
