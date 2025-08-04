import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Package, FileText, Building, X } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'project' | 'blog' | 'page';
  url: string;
  image?: string;
  category?: string;
}

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

export const GlobalSearch = ({ trigger }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, description, category, image_url')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (products) {
        searchResults.push(...products.map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || '',
          type: 'product' as const,
          url: `/products/${product.id}`,
          image: product.image_url,
          category: product.category
        })));
      }

      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, description, category, featured_image')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (projects) {
        searchResults.push(...projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || '',
          type: 'project' as const,
          url: `/projects/${project.id}`,
          image: project.featured_image,
          category: project.category
        })));
      }

      // Search blog posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, category, featured_image')
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (posts) {
        searchResults.push(...posts.map(post => ({
          id: post.id,
          title: post.title,
          description: post.excerpt || '',
          type: 'blog' as const,
          url: `/blog/${post.id}`,
          image: post.featured_image,
          category: post.category
        })));
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    // Navigate to result
    navigate(result.url);
    setOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4" />;
      case 'project': return <Building className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'blog': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
      <Search className="mr-2 h-4 w-4" />
      Search...
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || defaultTrigger}
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search products, projects, blog posts..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? 'Searching...' : 'No results found.'}
          </CommandEmpty>
          
          {query.length <= 2 && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => setQuery(search)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(result.type)}
                      <span className="font-medium">{result.title}</span>
                      <Badge className={getTypeColor(result.type)}>
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {result.description}
                    </p>
                    {result.category && (
                      <p className="text-xs text-muted-foreground">
                        {result.category}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;