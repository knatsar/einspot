import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';
import GlobalSearch from '@/components/GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Phone, Mail, User, LogOut, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  // Use the new responsive navigation component
  return <ResponsiveNavigation />;
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        {/* Top contact bar */}
        <div className="hidden md:flex items-center justify-end py-2 text-sm text-muted-foreground border-b border-border/50">
          <div className="flex items-center gap-6">
            <a href="tel:+234-8123647982" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              +234-8123647982
            </a>
            <a href="mailto:info@einspot.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              info@einspot.com
            </a>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/a4aace6d-dfa3-4938-978f-0881cc2ec66b.png" 
              alt="EINSPOT Logo"
              className="h-12 w-auto mr-3"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <GlobalSearch />
          </div>

          <div className="hidden lg:flex items-center gap-2 mr-4">
            <ShoppingCart />
          </div>

          <div className="hidden lg:flex items-center gap-4">
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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-8">
                <div className="flex items-center justify-between mb-8">
                  <img 
                    src="/lovable-uploads/a4aace6d-dfa3-4938-978f-0881cc2ec66b.png" 
                    alt="EINSPOT Logo"
                    className="h-10 w-auto"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* User Profile Section in Mobile Menu */}
                {user && (
                  <div className="bg-accent/50 rounded-lg p-4 mb-4">
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
                  </div>
                )}

                {/* Mobile Search and Cart */}
                <div className="flex items-center gap-2 mb-4">
                  <GlobalSearch />
                  <ShoppingCart />
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    item.href.startsWith('#') ? (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center py-3 px-4 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center py-3 px-4 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </nav>

                {!user && (
                  <div className="flex flex-col gap-3 pt-4">
                    <Button variant="outline" onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}>
                      Sign In
                    </Button>
                    <Button variant="hero" onClick={() => {
                      navigate('/products');
                      setIsOpen(false);
                    }}>
                      Get Quote
                    </Button>
                  </div>
                )}

                <div className="pt-6 space-y-3 text-sm text-muted-foreground">
                  <a href="tel:+234-8123047992" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    +234-8123047992
                  </a>
                  <a href="mailto:info@einspot.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    info@einspot.com
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;