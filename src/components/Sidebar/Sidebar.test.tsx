import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Sidebar } from './Sidebar';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Spec 008 + 012: Sidebar (Rail Mode + Scrollable Zones)', () => {
  it('renders with header, content, and footer', () => {
    renderWithMantine(
      <Sidebar header={<div>Header</div>} footer={<div>Footer</div>}>
        <div>Content</div>
      </Sidebar>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('has aria-label for navigation', () => {
    renderWithMantine(<Sidebar>Content</Sidebar>);
    expect(screen.getByLabelText('Sidebar navigation')).toBeInTheDocument();
  });

  it('collapse toggle button triggers collapse/expand', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithMantine(
      <Sidebar onCollapsedChange={onChange}>Content</Sidebar>,
    );

    const toggle = screen.getByLabelText('Toggle sidebar');
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);

    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('controlled collapsed state works', () => {
    const { rerender } = renderWithMantine(
      <Sidebar collapsed={false}>Content</Sidebar>,
    );
    const nav = screen.getByLabelText('Sidebar navigation');
    expect(nav).not.toHaveAttribute('data-collapsed');

    rerender(
      <MantineProvider>
        <Sidebar collapsed={true}>Content</Sidebar>
      </MantineProvider>,
    );
    expect(nav).toHaveAttribute('data-collapsed');
  });

  it('defaultCollapsed sets initial state', () => {
    renderWithMantine(<Sidebar defaultCollapsed>Content</Sidebar>);
    const nav = screen.getByLabelText('Sidebar navigation');
    expect(nav).toHaveAttribute('data-collapsed');
  });

  it('collapse toggle has correct aria-expanded', async () => {
    const user = userEvent.setup();
    renderWithMantine(<Sidebar>Content</Sidebar>);
    const toggle = screen.getByLabelText('Toggle sidebar');
    // Initially expanded (not collapsed)
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides collapse toggle when showCollapseToggle=false', () => {
    renderWithMantine(<Sidebar showCollapseToggle={false}>Content</Sidebar>);
    expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();
  });

  it('renders without header/footer when not provided', () => {
    renderWithMantine(<Sidebar>Content only</Sidebar>);
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });
});
