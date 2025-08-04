import { create } from 'zustand';
import { CustomUrl } from '@/utils/url-management';

interface UrlState {
  urls: Map<string, CustomUrl>;
  loading: Map<string, boolean>;
  error: Error | null;
  optimisticUpdates: Map<string, CustomUrl>;
  setLoading: (id: string, loading: boolean) => void;
  setError: (error: Error | null) => void;
  addUrl: (url: CustomUrl) => void;
  updateUrl: (id: string, url: CustomUrl) => void;
  deleteUrl: (id: string) => void;
  addOptimisticUpdate: (id: string, url: CustomUrl) => void;
  removeOptimisticUpdate: (id: string) => void;
}

export const useUrlStore = create<UrlState>((set) => ({
  urls: new Map(),
  loading: new Map(),
  error: null,
  optimisticUpdates: new Map(),
  setLoading: (id, loading) =>
    set((state) => {
      const newLoading = new Map(state.loading);
      newLoading.set(id, loading);
      return { loading: newLoading };
    }),
  setError: (error) => set({ error }),
  addUrl: (url) =>
    set((state) => {
      const newUrls = new Map(state.urls);
      newUrls.set(url.id, url);
      return { urls: newUrls };
    }),
  updateUrl: (id, url) =>
    set((state) => {
      const newUrls = new Map(state.urls);
      newUrls.set(id, url);
      return { urls: newUrls };
    }),
  deleteUrl: (id) =>
    set((state) => {
      const newUrls = new Map(state.urls);
      newUrls.delete(id);
      return { urls: newUrls };
    }),
  addOptimisticUpdate: (id, url) =>
    set((state) => {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(id, url);
      return { optimisticUpdates: newOptimisticUpdates };
    }),
  removeOptimisticUpdate: (id) =>
    set((state) => {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(id);
      return { optimisticUpdates: newOptimisticUpdates };
    }),
}));
