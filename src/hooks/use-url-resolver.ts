import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UrlResolverResult {
  loading: boolean;
  notFound: boolean;
  data: any;
  customUrl: string | null;
}

export function useUrlResolver(path: string, entityType: 'product' | 'project' | 'post' | 'page' | 'service' | 'blog') {
  const [result, setResult] = useState<UrlResolverResult>({
    loading: true,
    notFound: false,
    data: null,
    customUrl: null
  });

  useEffect(() => {
    const resolveUrl = async () => {
      try {
        setResult(prev => ({ ...prev, loading: true }));
        
        // First, try to fetch directly by UUID (most common case)
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(path);
        
        if (isUuid) {
          console.log('🔍 Resolving UUID:', path);
          
          // Determine the correct table name
          const tableName = entityType === 'post' ? 'blog_posts' : `${entityType}s`;
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', path)
            .single();

          if (error) {
            console.error('❌ Error fetching by UUID:', error);
            if (error.code === 'PGRST116') {
              setResult({ loading: false, notFound: true, data: null, customUrl: null });
              return;
            }
            throw error;
          }

          console.log('✅ Found data by UUID:', data);
          
          // Check if this entity has a custom URL
          try {
            const { data: customUrls } = await supabase
              .from('custom_urls')
              .select('*')
              .eq('entity_type', entityType)
              .eq('entity_id', path)
              .eq('is_active', true);

            const activeCustomUrl = customUrls?.[0];
            
            setResult({
              loading: false,
              notFound: false,
              data,
              customUrl: activeCustomUrl?.custom_path || null
            });
          } catch (customUrlError) {
            console.warn('⚠️ Could not fetch custom URL, proceeding without:', customUrlError);
            setResult({
              loading: false,
              notFound: false,
              data,
              customUrl: null
            });
          }
          return;
        }

        // If not UUID, try to resolve as custom URL
        console.log('🔍 Resolving custom URL:', path);
        
        const { data: customUrl, error: customUrlError } = await supabase
          .from('custom_urls')
          .select('*')
          .eq('custom_path', path)
          .eq('is_active', true)
          .single();

        if (customUrlError) {
          console.error('❌ Custom URL not found:', customUrlError);
          setResult({ loading: false, notFound: true, data: null, customUrl: null });
          return;
        }

        console.log('✅ Found custom URL:', customUrl);

        // Fetch the actual entity data using the custom URL mapping
        const tableName = customUrl.entity_type === 'post' ? 'blog_posts' : `${customUrl.entity_type}s`;
        
        const { data: entityData, error: entityError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', customUrl.entity_id)
          .single();

        if (entityError) {
          console.error('❌ Error fetching entity data:', entityError);
          if (entityError.code === 'PGRST116') {
            setResult({ loading: false, notFound: true, data: null, customUrl: null });
            return;
          }
          throw entityError;
        }

        console.log('✅ Found entity data via custom URL:', entityData);

        setResult({
          loading: false,
          notFound: false,
          data: entityData,
          customUrl: customUrl.custom_path
        });

      } catch (error) {
        console.error('💥 Error resolving URL:', error);
        setResult({ loading: false, notFound: true, data: null, customUrl: null });
      }
    };

    if (path) {
      resolveUrl();
    } else {
      setResult({ loading: false, notFound: true, data: null, customUrl: null });
    }
  }, [path, entityType]);

  return result;
}