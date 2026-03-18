import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { NavThemeProvider, useNavTheme } from './NavThemeProvider';
import type { ReactNode } from 'react';

describe('Phase 8: NavThemeProvider', () => {
  it('renders children with preset', () => {
    render(
      <NavThemeProvider preset="minimal">
        <div>Content</div>
      </NavThemeProvider>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('sets data-nav-theme attribute', () => {
    render(
      <NavThemeProvider preset="corporate">
        <div data-testid="inner">Content</div>
      </NavThemeProvider>,
    );
    const wrapper = screen.getByTestId('inner').parentElement!;
    expect(wrapper).toHaveAttribute('data-nav-theme', 'corporate');
  });

  it('sets dir attribute for RTL', () => {
    render(
      <NavThemeProvider dir="rtl">
        <div data-testid="inner">Content</div>
      </NavThemeProvider>,
    );
    const wrapper = screen.getByTestId('inner').parentElement!;
    expect(wrapper).toHaveAttribute('dir', 'rtl');
  });

  it('useNavTheme returns context values', () => {
    function wrapper({ children }: { children: ReactNode }) {
      return <NavThemeProvider preset="playful" dir="rtl">{children}</NavThemeProvider>;
    }
    const { result } = renderHook(() => useNavTheme(), { wrapper });
    expect(result.current.preset).toBe('playful');
    expect(result.current.dir).toBe('rtl');
  });
});
