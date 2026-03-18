import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Nav, NavLayout } from './Nav';
import type { NavConfig } from '../../types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Phase 8: Dual API + Layout', () => {
  it('Nav renders from config object', () => {
    const config: NavConfig = {
      items: [
        { type: 'link', id: 'home', label: 'Home', href: '/' },
        { type: 'link', id: 'about', label: 'About', href: '/about' },
      ],
    };
    renderWithMantine(<Nav config={config} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('NavLayout renders sidebar, navbar, and children', () => {
    render(
      <NavLayout
        navbar={<div>Navbar</div>}
        sidebar={<div>Sidebar</div>}
      >
        <div>Main Content</div>
      </NavLayout>,
    );
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('NavLayout renders without sidebar/navbar', () => {
    render(
      <NavLayout>
        <div>Content Only</div>
      </NavLayout>,
    );
    expect(screen.getByText('Content Only')).toBeInTheDocument();
  });
});
