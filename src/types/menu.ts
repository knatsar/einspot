export interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  parent_id?: string | null;
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  setItems: (items: MenuItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface MenuOperations {
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  reorderMenuItems: (items: MenuItem[]) => Promise<void>;
}
