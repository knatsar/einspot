import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    show_price: boolean;
  };
}

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadGuestCart = () => {
      try {
        const savedCart = localStorage.getItem('einspot_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Validate the cart structure
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('einspot_cart');
      }
    };

    loadGuestCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('einspot_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);
  const addToCart = (productId: string, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      let updatedItems;
      
      if (existingItem) {
        updatedItems = prevItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random()}`,
          product_id: productId,
          quantity,
          product: {
            id: productId,
            name: 'Loading...',
            price: 0,
            image_url: '',
            category: '',
            show_price: true
          }
        };
        updatedItems = [...prevItems, newItem];
        
        // Fetch product details asynchronously
        fetchProductDetails(productId, newItem.id);
      }
      
      // Removed cart notification for cleaner UX in production
      
      return updatedItems;
    });
  };

  const fetchProductDetails = async (productId: string, cartItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId
            ? {
                ...item,
                product: {
                  id: data.id,
                  name: data.name,
                  price: data.price || 0,
                  image_url: data.image_url || '',
                  category: data.category || '',
                  show_price: data.show_price !== false
                }
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.product_id !== productId);
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
      
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('einspot_cart');
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isOpen,
    setIsOpen,
  };

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

export const ShoppingCart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, isOpen, setIsOpen, clearCart } = useShoppingCart();

  if (cartItems.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <CartIcon className="h-4 w-4" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              0
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64">
            <CartIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <CartIcon className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart ({getTotalItems()} items)</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto mt-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">Product {item.id.slice(0, 8)}...</h4>
                        <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total: ₦{getTotalPrice().toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const CartSummary = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useShoppingCart();
  
  if (cartItems.length === 0) return null;
  
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Cart Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Items ({getTotalItems()})</span>
            <span>₦{getTotalPrice().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₦{getTotalPrice().toLocaleString()}</span>
          </div>
        </div>
        
        <Button className="w-full mt-4">
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShoppingCart;