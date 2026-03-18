'use client';

import { useCallback, useRef, useState } from 'react';
import type { NavItemType } from '../types';

export interface UseReorderableNavOptions<TData = unknown> {
  items: NavItemType<TData>[];
  onReorder: (items: NavItemType<TData>[], fromIndex: number, toIndex: number) => void;
  reorderScope?: 'siblings' | 'root';
}

export interface UseReorderableNavReturn<TData = unknown> {
  orderedItems: NavItemType<TData>[];
  draggedId: string | null;
  dropTargetId: string | null;
  handleDragStart: (id: string) => void;
  handleDragOver: (id: string) => void;
  handleDragEnd: () => void;
  getDragHandleProps: (id: string) => {
    draggable: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
  };
  getDropTargetProps: (id: string) => {
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    'data-drop-target': boolean | undefined;
  };
}

export function useReorderableNav<TData = unknown>({
  items,
  onReorder,
}: UseReorderableNavOptions<TData>): UseReorderableNavReturn<TData> {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const dropTargetIdRef = useRef<string | null>(null);

  // Keep orderedItems in sync with prop changes
  if (items !== orderedItems && !draggedId) {
    setOrderedItems(items);
  }

  const handleDragStart = useCallback((id: string) => {
    // Check if item is disabled
    const item = items.find((i) => i.id === id);
    if (item?.disabled) return;
    setDraggedId(id);
    draggedIdRef.current = id;
  }, [items]);

  const handleDragOver = useCallback((id: string) => {
    setDropTargetId(id);
    dropTargetIdRef.current = id;
  }, []);

  const handleDragEnd = useCallback(() => {
    const currentDropTarget = dropTargetIdRef.current;
    if (draggedIdRef.current && currentDropTarget && draggedIdRef.current !== currentDropTarget) {
      const fromIndex = orderedItems.findIndex((i) => i.id === draggedIdRef.current);
      const toIndex = orderedItems.findIndex((i) => i.id === currentDropTarget);
      if (fromIndex >= 0 && toIndex >= 0) {
        const newItems = [...orderedItems];
        const [moved] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, moved!);
        setOrderedItems(newItems);
        onReorder(newItems, fromIndex, toIndex);
      }
    }
    setDraggedId(null);
    setDropTargetId(null);
    draggedIdRef.current = null;
    dropTargetIdRef.current = null;
  }, [orderedItems, onReorder]);

  const getDragHandleProps = useCallback(
    (id: string) => ({
      draggable: true,
      onDragStart: () => handleDragStart(id),
      onDragEnd: handleDragEnd,
    }),
    [handleDragStart, handleDragEnd],
  );

  const getDropTargetProps = useCallback(
    (id: string) => ({
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        handleDragOver(id);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        handleDragEnd();
      },
      'data-drop-target': dropTargetId === id || undefined,
    }),
    [handleDragOver, handleDragEnd, dropTargetId],
  );

  return {
    orderedItems,
    draggedId,
    dropTargetId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getDragHandleProps,
    getDropTargetProps,
  };
}
