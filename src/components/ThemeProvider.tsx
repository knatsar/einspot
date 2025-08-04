import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { SiteLoadingSkeleton } from '@/components/ui/site-loading-skeleton'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initialize, loading, error } = useThemeStore()

  useEffect(() => {
    let isMounted = true
    
    const initializeTheme = async () => {
      try {
        await initialize()
      } catch (error) {
        if (isMounted) {
          console.warn('Theme initialization failed, using defaults:', error)
          useThemeStore.setState({ 
            loading: false,
            error: null // Don't show error, just use defaults
          })
        }
      }
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && useThemeStore.getState().loading) {
        useThemeStore.setState({ 
          loading: false, 
          error: null // Don't show timeout as error
        })
      }
    }, 2000) // 2 second timeout

    initializeTheme()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [initialize])

  if (loading) {
    return <SiteLoadingSkeleton />
  }

  if (error) {
    console.error('Theme loading error:', error)
    // Don't show error UI, just render with default theme
    return children
  }

  return <>{children}</>
}
