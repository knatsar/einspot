import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Phone, Mail, User, LogOut, Shield, Search, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/GlobalSearch';
import { ShoppingCart as ShoppingCartComponent } from '@/components/ShoppingCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ResponsiveNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Products', href: '/products' },
    { name: 'Projects', href: '/projects' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '#contact' },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        {/* Top contact bar - Desktop only */}
        <div className="hidden md:flex items-center justify-end py-2 text-sm text-muted-foreground border-b border-border/50">
          <div className="flex items-center gap-6">
            <motion.a 
              href="tel:+234-8123647982" 
              className="flex items-center gap-2 hover:text-primary transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Phone className="h-4 w-4" />
              +234-8123647982
            </motion.a>
            <motion.a 
              href="mailto:info@einspot.com" 
              className="flex items-center gap-2 hover:text-primary transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Mail className="h-4 w-4" />
              info@einspot.com
            </motion.a>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src="/lovable-uploads/a4aace6d-dfa3-4938-978f-0881cc2ec66b.png" 
              alt="EINSPOT Logo"
              className="h-12 w-auto mr-3"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.href.startsWith('#') ? (
                  <a
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 font-medium relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 font-medium relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <GlobalSearch />
            <ShoppingCartComponent />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(userRole === 'superadmin' || userRole === 'admin') ? (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate('/products')}>
                  Get Quote
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Cart */}
            <ShoppingCartComponent />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <motion.div
                  variants={menuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex flex-col h-full"
                >
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <img 
                      src="/lovable-uploads/a4aace6d-dfa3-4938-978f-0881cc2ec66b.png" 
                      alt="EINSPOT Logo"
                      className="h-10 w-auto"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* User Profile Section */}
                  {user && (
                    <motion.div 
                      variants={itemVariants}
                      className="bg-accent/50 rounded-lg p-4 m-6 mb-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(userRole === 'superadmin' || userRole === 'admin') ? (
                          <Button variant="outline" className="w-full" onClick={() => {
                            navigate('/admin');
                            setIsOpen(false);
                          }}>
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" onClick={() => {
                            navigate('/dashboard');
                            setIsOpen(false);
                          }}>
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        )}
                        <Button variant="destructive" size="icon" onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}>
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Items */}
                  <nav className="flex-1 px-6">
                    <motion.div className="space-y-1">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          variants={itemVariants}
                          transition={{ delay: index * 0.1 }}
                        >
                          {item.href.startsWith('#') ? (
                            <a
                              href={item.href}
                              className="flex items-center py-3 px-4 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              to={item.href}
                              className="flex items-center py-3 px-4 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </nav>

                  {/* Mobile Auth Buttons */}
                  {!user && (
                    <motion.div 
                      variants={itemVariants}
                      className="p-6 border-t space-y-3"
                    >
                      <Button variant="outline" className="w-full" onClick={() => {
                        navigate('/auth');
                        setIsOpen(false);
                      }}>
                        Sign In
                      </Button>
                      <Button variant="hero" className="w-full" onClick={() => {
                        navigate('/products');
                        setIsOpen(false);
                      }}>
                        Get Quote
                      </Button>
                    </motion.div>
                  )}

                  {/* Contact Info */}
                  <motion.div 
                    variants={itemVariants}
                    className="p-6 border-t space-y-3 text-sm text-muted-foreground"
                  >
                    <a href="tel:+234-8123047992" className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                      +234-8123047992
                    </a>
                    <a href="mailto:info@einspot.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                      info@einspot.com
                    </a>
                  </motion.div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t py-4"
            >
              <GlobalSearch />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default ResponsiveNavigation;