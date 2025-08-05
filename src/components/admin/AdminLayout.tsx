import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Store,
  Mail,
  Settings,
  Users,
  FileText,
  Package,
  MessageSquare,
  Layout,
  FileCode,
  Image,
  Menu,
  Palette,
  CreditCard,
  BarChart2,
  CheckSquare
} from 'lucide-react';

const menuItems = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Overview', path: '/admin' },
  { icon: <Store className="h-4 w-4" />, label: 'Products', path: '/admin/products' },
  { icon: <FileText className="h-4 w-4" />, label: 'Blog', path: '/admin/blog' },
  { icon: <Package className="h-4 w-4" />, label: 'Projects', path: '/admin/projects' },
  { icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', path: '/admin/chat' },
  { icon: <Layout className="h-4 w-4" />, label: 'Site Content', path: '/admin/site' },
  { icon: <Menu className="h-4 w-4" />, label: 'Menu', path: '/admin/menu' },
  { icon: <Image className="h-4 w-4" />, label: 'Assets', path: '/admin/assets' },
  { icon: <Mail className="h-4 w-4" />, label: 'Email', path: '/admin/email' },
  { icon: <Users className="h-4 w-4" />, label: 'Users', path: '/admin/users' },
  { icon: <Palette className="h-4 w-4" />, label: 'Themes', path: '/admin/themes' },
  { icon: <CreditCard className="h-4 w-4" />, label: 'Payments', path: '/admin/payments' },
  { icon: <BarChart2 className="h-4 w-4" />, label: 'Analytics', path: '/admin/analytics' },
  { icon: <CheckSquare className="h-4 w-4" />, label: 'Orders', path: '/admin/orders' },
  { icon: <Settings className="h-4 w-4" />, label: 'Settings', path: '/admin/settings' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { userRole } = useAuth();
  const location = useLocation();

  // The ProtectedRoute component will handle loading and access denial.
  // We can add a fallback here for extra safety, but the primary check is done by the router.
  if (!userRole || (userRole !== 'admin' && userRole !== 'superadmin')) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this area. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[240px,1fr] h-screen bg-background">
      <aside className="border-r bg-muted/30">
        <ScrollArea className="h-full py-6 px-4">
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 font-normal hover:bg-accent/50",
                  location.pathname === item.path && "bg-accent"
                )}
                asChild
              >
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <main className="overflow-auto">
        <div className="container p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
