import { create } from 'zustand';

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  parent_id: string | null;
  order: number;
  icon?: string;
}

interface MenuState {
  items: Map<string, MenuItem>;
  selectedItems: Set<string>;
  loading: boolean;
  error: Error | null;
  setItems: (items: MenuItem[]) => void;
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reorderItems: (itemIds: string[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: new Map(),
  selectedItems: new Set(),
  loading: false,
  error: null,

  setItems: (items) =>
    set(() => ({
      items: new Map(items.map((item) => [item.id, item])),
    })),

  addItem: (item) =>
    set((state) => {
      const newItems = new Map(state.items);
      newItems.set(item.id, item);
      return { items: newItems };
    }),

  updateItem: (id, updates) =>
    set((state) => {
      const item = state.items.get(id);
      if (!item) return state;

      const newItems = new Map(state.items);
      newItems.set(id, { ...item, ...updates });
      return { items: newItems };
    }),

  deleteItem: (id) =>
    set((state) => {
      const newItems = new Map(state.items);
      newItems.delete(id);
      return { items: newItems };
    }),

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
    set(() => ({
      selectedItems: new Set(),
    })),

  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  setError: (error) =>
    set(() => ({
      error,
    })),

  reorderItems: (itemIds) =>
    set((state) => {
      const newItems = new Map(state.items);
      itemIds.forEach((id, index) => {
        const item = newItems.get(id);
        if (item) {
          newItems.set(id, { ...item, order: index });
        }
      });
      return { items: newItems };
    }),
}));
