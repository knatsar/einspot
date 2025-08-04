import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  ShoppingCart,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin'
  },
  {
    title: 'Users',
    icon: Users,
    href: '/admin/users'
  },
  {
    title: 'Menu',
    icon: Menu,
    href: '/admin/menu'
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders'
  },
  {
    title: 'Quotations',
    icon: FileText,
    href: '/admin/quotations'
  },
  {
    title: 'URLs',
    icon: LinkIcon,
    href: '/admin/urls'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings'
  }
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-6">
        <h2 className="px-4 text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t pt-4">
        <Link
          to="/admin/profile"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Admin Settings
        </Link>
      </div>
    </aside>
  );
}
