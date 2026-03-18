import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavGroup } from './NavGroup';
import type { NavItemType } from '../../types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const items: NavItemType[] = [
  {
    type: 'group',
    id: 'group-a',
    label: 'Group A',
    children: [
      { type: 'link', id: 'a1', label: 'A1', href: '/a1' },
    ],
  },
  {
    type: 'group',
    id: 'group-b',
    label: 'Group B',
    children: [
      { type: 'link', id: 'b1', label: 'B1', href: '/b1' },
    ],
  },
  {
    type: 'group',
    id: 'group-c',
    label: 'Group C',
    children: [
      {
        type: 'group',
        id: 'group-c1',
        label: 'Group C1',
        children: [
          { type: 'link', id: 'c1a', label: 'C1A', href: '/c1a' },
        ],
      },
    ],
  },
];

describe('Spec 002: Accordion Mode', () => {
  it('with accordion=true, opening group B auto-closes group A (sibling scope)', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <NavGroup items={items} accordion currentPath="/none" />,
    );

    const groupA = screen.getByText('Group A').closest('button')!;
    const groupB = screen.getByText('Group B').closest('button')!;

    await user.click(groupA);
    expect(groupA).toHaveAttribute('aria-expanded', 'true');

    await user.click(groupB);
    expect(groupB).toHaveAttribute('aria-expanded', 'true');
    expect(groupA).toHaveAttribute('aria-expanded', 'false');
  });

  it('with accordionScope="global", opening any group closes all others', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <NavGroup items={items} accordion accordionScope="global" currentPath="/none" />,
    );

    const groupA = screen.getByText('Group A').closest('button')!;
    const groupC = screen.getByText('Group C').closest('button')!;

    await user.click(groupA);
    expect(groupA).toHaveAttribute('aria-expanded', 'true');

    await user.click(groupC);
    expect(groupC).toHaveAttribute('aria-expanded', 'true');
    expect(groupA).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsing the open group results in no groups open', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <NavGroup items={items} accordion currentPath="/none" />,
    );

    const groupA = screen.getByText('Group A').closest('button')!;
    await user.click(groupA);
    expect(groupA).toHaveAttribute('aria-expanded', 'true');

    await user.click(groupA);
    expect(groupA).toHaveAttribute('aria-expanded', 'false');
  });

  it('onAccordionChange fires with the correct key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithMantine(
      <NavGroup items={items} accordion onAccordionChange={onChange} currentPath="/none" />,
    );

    await user.click(screen.getByText('Group A'));
    expect(onChange).toHaveBeenCalledWith('group-a');

    await user.click(screen.getByText('Group A'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('multiple defaultOpened siblings — only first is respected in accordion mode', () => {
    const itemsWithDefaults: NavItemType[] = [
      {
        type: 'group',
        id: 'g1',
        label: 'G1',
        defaultOpened: true,
        children: [{ type: 'link', id: 'l1', label: 'L1', href: '/l1' }],
      },
      {
        type: 'group',
        id: 'g2',
        label: 'G2',
        defaultOpened: true,
        children: [{ type: 'link', id: 'l2', label: 'L2', href: '/l2' }],
      },
    ];
    renderWithMantine(
      <NavGroup items={itemsWithDefaults} accordion currentPath="/none" />,
    );

    const g1 = screen.getByText('G1').closest('button')!;
    const g2 = screen.getByText('G2').closest('button')!;
    expect(g1).toHaveAttribute('aria-expanded', 'true');
    expect(g2).toHaveAttribute('aria-expanded', 'false');
  });
});
