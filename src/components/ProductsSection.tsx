import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Zap, Shield, DollarSign, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnhancedProductCard from '@/components/EnhancedProductCard';
import { HoverCard, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/micro-interactions';
import { supabase } from '@/integrations/supabase/client';
import { useShoppingCart } from '@/components/ShoppingCart';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string | null;
  price: number | null;
  image_url: string | null;
  show_price?: boolean;
  is_featured?: boolean;
  brand?: string;
  specifications?: any;
}

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    const cat = category?.toLowerCase() || '';
    switch (cat) {
      case 'solar': return <Zap className="h-4 w-4" />;
      case 'hvac': return <Shield className="h-4 w-4" />;
      case 'water': return <Star className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    const cat = category?.toLowerCase() || '';
    switch (cat) {
      case 'solar': return 'bg-yellow-100 text-yellow-800';
      case 'hvac': return 'bg-blue-100 text-blue-800';
      case 'battery': return 'bg-green-100 text-green-800';
      case 'inverter': return 'bg-purple-100 text-purple-800';
      case 'water': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
    toast({
      title: "Added to Cart",
      description: "Product added to your cart successfully",
    });
  };

  const handleQuoteRequest = (product: Product) => {
    const message = `Hello EINSPOT, I'd like a quote for: ${product.name}\n\nName: \nCompany: \nLocation: \nQuantity: `;
    const whatsappUrl = `https://wa.me/2348123647982?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Quote Request",
      description: "Redirecting to WhatsApp for quote request",
    });
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  if (loading) {
    return (
      <section id="products" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Featured Products</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Premium Engineering Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our range of high-quality engineering products and systems, 
              carefully selected for durability, efficiency, and performance in Nigerian conditions.
            </p>
          </div>
        </FadeIn>

        {/* Products Grid */}
        <StaggerContainer>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    
                    {product.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 mb-2">
                        {product.category && (
                          <Badge className={`${getCategoryColor(product.category)} flex items-center gap-1`}>
                            {getCategoryIcon(product.category)}
                            {product.category}
                          </Badge>
                        )}
                        {product.brand && (
                          <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                            {product.brand}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                      <p className="text-sm text-white/90 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Price Display - Respects show_price setting */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {product.show_price !== false && product.price ? (
                            <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
                          ) : (
                            <span className="text-lg font-medium">Contact for Price</span>
                          )}
                        </div>
                        
                        {product.specifications && (
                          <Badge variant="outline" className="text-xs">
                            Certified
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {product.show_price !== false && product.price ? (
                            <Button
                              onClick={() => handleAddToCart(product.id)}
                              className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                              variant="outline"
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleQuoteRequest(product)}
                              className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                              variant="outline"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Get Quote
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleViewDetails(product)}
                            className="flex-1"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* View All Products CTA */}
        <div className="text-center mb-20">
          <Link to="/products">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Quality Guaranteed</h3>
            <p className="text-muted-foreground">All products come with comprehensive warranties and quality certifications.</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">High Efficiency</h3>
            <p className="text-muted-foreground">State-of-the-art technology ensuring maximum performance and efficiency.</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Expert Support</h3>
            <p className="text-muted-foreground">Professional installation and ongoing technical support for all products.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;