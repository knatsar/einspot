import { create } from 'zustand';
import type { MenuItem } from '@/components/admin/MenuManager';

interface MenuOperationState {
  loading: boolean;
  error: Error | null;
  retryCount: number;
  operation: 'create' | 'update' | 'delete' | 'reorder' | null;
  itemId: string | null;
}

interface MenuState {
  items: MenuItem[];
  operations: Map<string, MenuOperationState>;
  selectedItems: Set<string>;
  initializeOperation: (operation: MenuOperationState['operation'], itemId: string) => void;
  setOperationLoading: (itemId: string, loading: boolean) => void;
  setOperationError: (itemId: string, error: Error | null) => void;
  incrementRetryCount: (itemId: string) => void;
  clearOperation: (itemId: string) => void;
  setItems: (items: MenuItem[]) => void;
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  reorderItems: (newOrder: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: [],
  operations: new Map(),
  selectedItems: new Set(),

  initializeOperation: (operation, itemId) =>
    set((state) => {
      const newOperations = new Map(state.operations);
      newOperations.set(itemId, {
        loading: true,
        error: null,
        retryCount: 0,
        operation,
        itemId,
      });
      return { operations: newOperations };
    }),

  setOperationLoading: (itemId, loading) =>
    set((state) => {
      const newOperations = new Map(state.operations);
      const operation = newOperations.get(itemId);
      if (operation) {
        newOperations.set(itemId, { ...operation, loading });
      }
      return { operations: newOperations };
    }),

  setOperationError: (itemId, error) =>
    set((state) => {
      const newOperations = new Map(state.operations);
      const operation = newOperations.get(itemId);
      if (operation) {
        newOperations.set(itemId, { ...operation, error });
      }
      return { operations: newOperations };
    }),

  incrementRetryCount: (itemId) =>
    set((state) => {
      const newOperations = new Map(state.operations);
      const operation = newOperations.get(itemId);
      if (operation) {
        newOperations.set(itemId, {
          ...operation,
          retryCount: operation.retryCount + 1,
        });
      }
      return { operations: newOperations };
    }),

  clearOperation: (itemId) =>
    set((state) => {
      const newOperations = new Map(state.operations);
      newOperations.delete(itemId);
      return { operations: newOperations };
    }),

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  toggleSelected: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedItems);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedItems: newSelected };
    }),

  clearSelected: () =>
    set({
      selectedItems: new Set(),
    }),

  reorderItems: (newOrder) =>
    set({
      items: newOrder,
    }),
}));
