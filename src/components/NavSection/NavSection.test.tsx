import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavSection } from './NavSection';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Spec 011: NavSection — Sections & Dividers', () => {
  it('section header renders with label', () => {
    renderWithMantine(
      <NavSection label="Main">
        <div>Items</div>
      </NavSection>,
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('divider renders at correct position', () => {
    renderWithMantine(
      <NavSection label="Section" divider="both">
        <div>Items</div>
      </NavSection>,
    );
    const separators = screen.getAllByRole('separator');
    expect(separators.length).toBe(2);
  });

  it('collapsible section toggles open/closed', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <NavSection label="Collapsible" collapsible>
        <div>Hidden content</div>
      </NavSection>,
    );

    const button = screen.getByText('Collapsible').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('rightSection renders on header', () => {
    renderWithMantine(
      <NavSection label="With Action" rightSection={<button>Add</button>}>
        <div>Items</div>
      </NavSection>,
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('ARIA roles applied correctly', () => {
    renderWithMantine(
      <NavSection label="Labeled Section">
        <div>Items</div>
      </NavSection>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders without label (divider only)', () => {
    renderWithMantine(
      <NavSection divider="top">
        <div>Items only</div>
      </NavSection>,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('Items only')).toBeInTheDocument();
  });

  it('defaultOpened=false starts collapsed', () => {
    renderWithMantine(
      <NavSection label="Closed" collapsible defaultOpened={false}>
        <div>Hidden</div>
      </NavSection>,
    );
    const button = screen.getByText('Closed').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
