import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useShoppingCart } from './ShoppingCart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye, 
  DollarSign,
  Package,
  Zap,
  Shield
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  show_price?: boolean;
  is_featured?: boolean;
  brand?: string;
}

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onQuoteRequest?: (product: Product) => void;
  className?: string;
}

export const EnhancedProductCard = ({ 
  product, 
  onAddToCart, 
  onQuoteRequest,
  className 
}: EnhancedProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useShoppingCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
    addToCart(product.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleQuoteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuoteRequest?.(product);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `${window.location.origin}/products/${product.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${product.name} ${isLiked ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hvac': return <Zap className="h-4 w-4" />;
      case 'solar': return <Shield className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hvac': return 'bg-blue-100 text-blue-800';
      case 'solar': return 'bg-yellow-100 text-yellow-800';
      case 'water': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card className="group cursor-pointer overflow-hidden border-0 bg-card hover:shadow-xl transition-all duration-300 relative">
        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Product Image */}
        <div 
          className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <motion.img
            src={product.image_url || 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}`);
                }}
                className="backdrop-blur-sm bg-white/90 hover:bg-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Product Info */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getCategoryColor(product.category)} flex items-center gap-1`}>
                  {getCategoryIcon(product.category)}
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </CardTitle>
              
              <CardDescription className="text-muted-foreground line-clamp-2 mt-2">
                {product.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-2xl font-bold text-primary">
              <DollarSign className="h-5 w-5 mr-1" />
              {product.show_price !== false ? (
                `₦${product.price.toLocaleString()}`
              ) : (
                <span className="text-base">Contact for Price</span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                variant="outline"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                onClick={handleQuoteRequest}
                className="flex-1"
              >
                Get Quote
              </Button>
            </div>
            
            <Button
              onClick={() => navigate(`/products/${product.id}`)}
              variant="ghost"
              className="w-full text-sm"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedProductCard;