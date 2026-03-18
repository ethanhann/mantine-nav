import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarResize } from './useSidebarResize';

describe('Spec 009: useSidebarResize', () => {
  it('returns default width', () => {
    const { result } = renderHook(() => useSidebarResize());
    expect(result.current.width).toBe(260);
    expect(result.current.isResizing).toBe(false);
  });

  it('returns custom default width', () => {
    const { result } = renderHook(() => useSidebarResize({ defaultWidth: 300 }));
    expect(result.current.width).toBe(300);
  });

  it('resetWidth restores default', () => {
    const { result } = renderHook(() => useSidebarResize({ defaultWidth: 300 }));
    act(() => result.current.resetWidth());
    expect(result.current.width).toBe(300);
  });

  it('getHandleProps returns correct props', () => {
    const { result } = renderHook(() => useSidebarResize());
    const props = result.current.getHandleProps();
    expect(props.role).toBe('separator');
    expect(props['aria-label']).toBe('Resize sidebar');
    expect(props['aria-orientation']).toBe('vertical');
    expect(typeof props.onMouseDown).toBe('function');
    expect(typeof props.onDoubleClick).toBe('function');
  });
});
