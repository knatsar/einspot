import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface ThemeConfig {
  id: string
  name: string
  is_active: boolean
  hero_config: {
    style: string
    background_type: string
    background_config?: {
      gradient?: string
      noise_opacity?: number
      animate?: boolean
    }
    title: string
    subtitle: string
    cta_buttons: Array<{
      text: string
      link: string
      style: string
    }>
    stats: Array<{
      value: string
      label: string
    }>
  }
  layout_config: {
    padding: string
    alignment: string
    maxWidth: string
  }
}

interface ThemeState {
  activeTheme: ThemeConfig | null;
  themes: ThemeConfig[];
  loading: boolean;
  error: Error | null;
  setActiveTheme: (theme: ThemeConfig) => Promise<void>;
  loadThemes: () => Promise<void>;
  initialize: () => Promise<void>;
}

const defaultThemes: ThemeConfig[] = [
  {
    id: 'dynamic-dark',
    name: 'Dynamic Dark',
    is_active: true,
    hero_config: {
      style: 'gradient_dynamic',
      background_type: 'gradient',
      background_config: {
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        noise_opacity: 0.03,
        animate: true
      },
      title: "Powering Nigeria's Energy Future",
      subtitle: "Leading provider of renewable energy solutions",
      cta_buttons: [
        { text: "Explore Products", link: "/products", style: "primary_dark" },
        { text: "Watch Demo", link: "#", style: "outline_dark" }
      ],
      stats: [
        { value: "500+", label: "Projects Completed" },
        { value: "50MW+", label: "Energy Generated" },
        { value: "15+", label: "Years Experience" },
        { value: "24/7", label: "Support Available" }
      ]
    },
    layout_config: {
      padding: '4rem',
      alignment: 'center',
      maxWidth: '1280px'
    }
  },
  {
    id: 'modern-light',
    name: 'Modern Light',
    is_active: false,
    hero_config: {
      style: 'gradient_overlay',
      background_type: 'image',
      title: "Powering Nigeria's Energy Future",
      subtitle: "Leading provider of renewable energy solutions, HVAC systems, and sustainable technologies.",
      cta_buttons: [
        { text: "Explore Products", link: "/products", style: "primary" },
        { text: "Watch Demo", link: "#", style: "outline" }
      ],
      stats: [
        { value: "500+", label: "Projects Completed" },
        { value: "50MW+", label: "Energy Generated" },
        { value: "15+", label: "Years Experience" },
        { value: "24/7", label: "Support Available" }
      ]
    },
    layout_config: {
      padding: '4rem',
      alignment: 'center',
      maxWidth: '1280px'
    }
  }
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeTheme: defaultThemes[0],
      themes: defaultThemes,
      loading: false,
      error: null,

      setActiveTheme: async (theme) => {
        try {
          // Optimistically update
          const previousTheme = get().activeTheme;
          set({ activeTheme: theme });
          
          // Removed theme change notification for production

          // Update in database
          const { error: deactivateError } = await supabase
            .from('themes')
            .update({ is_active: false })
            .neq('id', theme.id);

          if (deactivateError) throw deactivateError

          // Activate selected theme
          const { error: activateError } = await supabase
            .from('themes')
            .update({ is_active: true })
            .eq('id', theme.id)

          if (activateError) throw activateError

          set({ activeTheme: theme })

          // Refresh themes list
          await get().loadThemes()
          
          // Force page refresh to apply theme changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
        } catch (error) {
          console.error('Failed to set active theme:', error);
          set({ error: error as Error })
        }
      },

      loadThemes: async () => {
        try {
          set({ loading: true, error: null })

          const { data: themes, error } = await supabase
            .from('themes')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error

          // Parse theme configurations
          const parsedThemes: ThemeConfig[] = themes.map(theme => ({
            id: theme.id,
            name: theme.name,
            is_active: theme.is_active,
            hero_config: typeof theme.hero_config === 'string' 
              ? JSON.parse(theme.hero_config)
              : theme.hero_config,
            layout_config: typeof theme.layout_config === 'string'
              ? JSON.parse(theme.layout_config)
              : theme.layout_config
          }))

          // Find active theme or use default
          const activeTheme = parsedThemes.find(theme => theme.is_active) || defaultThemes[0]

          set({ 
            themes: parsedThemes, 
            activeTheme,
            loading: false 
          })
          
        } catch (error) {
          console.error('Failed to load themes:', error)
          set({ error: error as Error, loading: false })
        }
      },

      initialize: async () => {
        const state = get()
        if (!state.activeTheme && !state.loading) {
          await state.loadThemes()
        }
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ activeTheme: state.activeTheme }),
    }
  )
)
