import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useShoppingCart } from '@/components/ShoppingCart';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star,
  Package,
  Truck,
  Shield,
  Phone,
  Loader2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  image_url?: string;
  gallery_images?: string[];
  show_price?: boolean;
  is_featured?: boolean;
  brand?: string;
  model_number?: string;
  features?: string;
  stock_status?: string;
  specifications?: any;
  meta_title?: string;
  meta_description?: string;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      // Handle both UUID and custom URL formats
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
      
      if (isUuid) {
        fetchProduct(id);
      } else {
        // Try to resolve custom URL
        fetchProductByCustomUrl(id);
      }
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductByCustomUrl = async (customPath: string) => {
    try {
      setLoading(true);
      
      // First, try to find the custom URL
      const { data: customUrl, error: urlError } = await supabase
        .from('custom_urls')
        .select('entity_id')
        .eq('custom_path', customPath)
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .single();

      if (urlError || !customUrl) {
        // If no custom URL found, try direct product lookup by model number or name
        const { data: productByName, error: nameError } = await supabase
          .from('products')
          .select('*')
          .or(`model_number.ilike.%${customPath}%,name.ilike.%${customPath}%`)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (nameError || !productByName) {
          throw new Error('Product not found');
        }
        
        setProduct(productByName);
        return;
      }

      // Fetch the actual product using the entity_id
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', customUrl.entity_id)
        .eq('is_active', true)
        .single();

      if (productError) throw productError;
      setProduct(product);
    } catch (error) {
      console.error('Error fetching product by custom URL:', error);
      toast({
        title: "Product Not Found",
        description: "The product you're looking for could not be found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product.id, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${product?.name} ${isLiked ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: product?.description || `Check out ${product?.name}`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const handleRequestQuote = () => {
    if (!product) return;
    
    const message = `Hello EINSPOT, I'd like a quote for: ${product.name}

Name: 
Company: 
Location: 
Quantity: ${quantity}

Additional requirements: `;
    
    const whatsappUrl = `https://wa.me/2348123647982?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Quote Request",
      description: "Redirecting to WhatsApp for quote request",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const images = product.gallery_images && product.gallery_images.length > 0 
    ? product.gallery_images 
    : [product.image_url || 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-blue-600">
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div 
              className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.is_featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {product.brand && (
                <p className="text-lg text-gray-600">by {product.brand}</p>
              )}
              
              {product.model_number && (
                <p className="text-sm text-gray-500">Model: {product.model_number}</p>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              {product.show_price !== false && product.price ? (
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-blue-600">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {product.stock_status || 'In Stock'}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-xl text-gray-600">Contact for Price</span>
                  <Button variant="outline" onClick={handleRequestQuote}>
                    <Phone className="h-4 w-4 mr-2" />
                    Request Quote
                  </Button>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                <div className="prose prose-sm text-gray-700">
                  {product.features.split('\n').map((feature, index) => (
                    <p key={index} className="mb-1">• {feature}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {product.show_price !== false && product.price && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleLike} className="flex-1">
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  {isLiked ? 'Favorited' : 'Add to Favorites'}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Warranty</p>
              </div>
              <div className="text-center">
                <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    </div>
  );
};