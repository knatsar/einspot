import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  brand: string;
  image_url: string;
  features: string;
}

interface SearchAndFilterProps {
  onResultsChange: (products: Product[]) => void;
}

export const SearchAndFilter = ({ onResultsChange }: SearchAndFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('category, brand, price')
        .eq('is_active', true);

      if (products) {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const prices = products.map(p => p.price || 0);
        const max = Math.max(...prices);

        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    };

    fetchFilterOptions();
  }, []);

  // Search and filter products
  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_active', true);

      // Text search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,features.ilike.%${searchTerm}%`);
      }

      // Category filter
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        query = query.in('brand', selectedBrands);
      }

      // Price range filter
      query = query
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      const { data: products, error } = await query;

      if (!error && products) {
        setSearchResults(products);
        onResultsChange(products);
      }
      
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, onResultsChange]);

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page using UUID
    navigate(`/products/${productId}`);
  };

  const handleQuickView = (product: Product) => {
    // Quick view modal functionality
    console.log('Quick view for product:', product.name);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
  };

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + 
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Brands */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Brands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={maxPrice}
                      min={0}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {activeFiltersCount > 0 && (
          <Button onClick={clearFilters} variant="ghost" size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          {selectedBrands.map(brand => (
            <Badge key={brand} variant="secondary" className="flex items-center gap-1">
              {brand}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleBrand(brand)}
              />
            </Badge>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setPriceRange([0, maxPrice])}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Quick Search Results */}
      {searchTerm && searchResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Quick Results ({searchResults.length})</h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {searchResults.slice(0, 5).map((product) => (
              <div 
                key={product.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleProductClick(product.id)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{product.name}</h5>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {product.show_price !== false ? (
                      `₦${product.price?.toLocaleString()}`
                    ) : (
                      'Contact for Price'
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};