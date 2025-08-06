import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import type { ProfileData } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as RovingFocusGroup from '@radix-ui/react-roving-focus';
import { 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Edit,
  Menu,
  Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminProductManager from '@/components/admin/AdminProductManager';
import AdminContentManager from '@/components/admin/AdminContentManager';
import AdminProjectManager from '@/components/admin/AdminProjectManager';
import AdminBlogManager from '@/components/admin/AdminBlogManager';
import AdminURLManager from '@/components/admin/AdminURLManager';
import AdminOrderManager from '@/components/admin/AdminOrderManager';
import AdminSiteManager from '@/components/admin/AdminSiteManager';
import AdminAssetManager from '@/components/admin/AdminAssetManager';
import AdminThemeManager from '@/components/admin/AdminThemeManager';
import AdminChatManager from '@/components/admin/AdminChatManager';
import { AdminSystemManager } from '@/components/admin/AdminSystemManager';
import AdminEmailManager from '@/components/admin/AdminEmailManager';
import AdminCurrencyManager from '@/components/admin/AdminCurrencyManager';
import AdminLanguageManager from '@/components/admin/AdminLanguageManager';
import AdminNewsletterManager from '@/components/admin/AdminNewsletterManager';
import AdminUserManager from '@/components/admin/AdminUserManager';
import { MenuManager } from '@/components/admin/MenuManager';
import { ProfileManager } from '@/components/admin/ProfileManager';
import { AdminSecurityCenter } from '@/components/admin/AdminSecurityCenter';
import AdminProductImporter from '@/components/admin/AdminProductImporter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TabNavigation } from '@/components/ui/tab-navigation';

import type { Order, Quotation } from '@/types/database';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface OrderStat {
  status: string;
  count: number;
  fill: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalQuotations: number;
  totalOrders: number;
  totalRevenue: number;
  pendingQuotations: number;
  recentOrders: Order[];
  recentQuotations: Quotation[];
  monthlyRevenue: MonthlyRevenue[];
  orderStats: OrderStat[];
}

const AdminDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [accessVerified, setAccessVerified] = useState(false);
  
  // Verify access immediately when component mounts
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth';
      return;
    }

    if (!authLoading && user && userRole !== 'superadmin') {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
      window.location.href = '/';
      return;
    }
  }, [user, userRole, authLoading]);

  const calculateMonthlyRevenue = useCallback((orders: any[]) => {
    if (!orders || !Array.isArray(orders)) return [];
    
    try {
      const monthly: Record<string, number> = {};
      orders.forEach(order => {
        if (order?.created_at && order?.total_amount) {
          const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
          monthly[month] = (monthly[month] || 0) + Number(order.total_amount || 0);
        }
      });

      return Object.entries(monthly).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Error calculating monthly revenue:', error);
      return [];
    }
  }, []);

  const calculateOrderStats = useCallback((orders: any[]) => {
    if (!orders || !Array.isArray(orders)) return [];
    
    try {
      const stats: Record<string, number> = orders.reduce((acc, order) => {
        if (order?.status) {
          acc[order.status] = (acc[order.status] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(stats).map(([status, count]) => ({
        status,
        count,
        fill: getStatusColor(status)
      }));
    } catch (error) {
      console.error('Error calculating order stats:', error);
      return [];
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    if (!user || (userRole !== 'admin' && userRole !== 'superadmin')) {
      return;
    }

    try {
      setLoading(true);
      
      // Fetch basic counts safely
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: totalQuotations } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true });

      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: pendingQuotations } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch orders data with items
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_id,
          total_amount,
          status,
          created_at,
          updated_at,
          order_items (*)
        `);

      // Fetch recent orders safely
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:profiles!orders_customer_id_fkey (
            full_name
          ),
          order_items (*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent quotations with all required fields
      const { data: recentQuotations } = await supabase
        .from('quotations')
        .select(`
          id,
          customer_id,
          total_amount,
          status,
          created_at,
          updated_at,
          valid_until,
          items,
          products:product_id (
            name
          ),
          profiles:customer_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const totalRevenue = (orders || []).reduce((sum, order) => {
        return sum + (order?.total_amount || 0);
      }, 0);

      setStats({
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        totalQuotations: totalQuotations || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingQuotations: pendingQuotations || 0,
        recentOrders: (recentOrders || []).map((order) => ({
          ...order,
          items: order?.order_items || []
        })) as Order[],
        recentQuotations: ((recentQuotations || []) as Array<any>)
          .filter((quotation): quotation is Record<string, any> => 
            quotation && typeof quotation === 'object'
          )
          .map(quotation => ({
            id: String(quotation?.id || ''),
            quotation_number: `QT-${String(quotation?.id || '').slice(0, 8)}`,
            customer_id: String(quotation?.customer_id || ''),
            total_amount: Number(quotation?.total_amount) || 0,
            status: quotation?.status || 'pending',
            valid_until: quotation?.valid_until || new Date().toISOString(),
            created_at: quotation?.created_at || new Date().toISOString(),
            updated_at: quotation?.updated_at || new Date().toISOString(),
            profiles: quotation?.profiles || { full_name: 'Unknown' },
            products: quotation?.products || { name: 'Unknown Product' },
            items: Array.isArray(quotation?.items) ? quotation.items : []
          } as Quotation)),
        monthlyRevenue: calculateMonthlyRevenue(orders || []),
        orderStats: calculateOrderStats(orders || [])
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, userRole, toast, calculateMonthlyRevenue, calculateOrderStats]);

  useEffect(() => {
    let isMounted = true;
    // Verify admin access once user and role are loaded
    if (!authLoading && user && userRole) {
      if (userRole === 'admin' || userRole === 'superadmin') {
        if (isMounted) {
          setAccessVerified(true);
        }
      } else {
        // Redirect to customer dashboard instead of showing error
        window.location.href = '/dashboard';
      }
    }
    return () => {
      isMounted = false;
    };
  }, [authLoading, user, userRole]);

  useEffect(() => {
    let isMounted = true;
    
    if (accessVerified && user && userRole) {
      fetchDashboardStats().catch(error => {
        if (isMounted) {
          console.error('Error fetching dashboard stats:', error);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [accessVerified, user, userRole, fetchDashboardStats]);

  // Show loading if auth is still loading or user/role not ready
  if (authLoading || !user || !userRole || !accessVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground">
            {!user ? 'Authenticating...' : 
             !userRole ? 'Loading user role...' : 
             !accessVerified ? 'Verifying admin access...' : 
             'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Navigation items organized by category
  const primaryTabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'email', label: 'Email', icon: Calendar },
    { id: 'newsletter', label: 'Newsletter', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'currency', label: 'Currency', icon: DollarSign },
    { id: 'language', label: 'Language', icon: FileText },
    { id: 'menus', label: 'Menu Management', icon: Menu },
  ];

  const secondaryTabs = [
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'themes', label: 'Themes', icon: Settings },
    { id: 'chat', label: 'Chat Bot', icon: AlertCircle },
    { id: 'site', label: 'Site Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'content', label: 'Page Content', icon: FileText },
  ];

  const managementTabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'urls', label: 'URL Management', icon: Settings },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'quotations', label: 'Quotations', icon: FileText },
  ];

  // Helper functions moved to useCallback above

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#fbbf24';
    case 'confirmed': return '#3b82f6';
    case 'processing': return '#f59e0b';
    case 'shipped': return '#8b5cf6';
    case 'delivered': return '#10b981';
    case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
};

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state for dashboard data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground">Loading dashboard data...</p>
          <p className="text-sm text-muted-foreground">Getting analytics and stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {userRole === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Welcome back, {user?.email} • {userRole === 'superadmin' ? 'Complete control over EINSPOT application' : 'Manage EINSPOT system'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => window.open('/', '_blank')} className="text-sm">
              <Edit className="h-4 w-4 mr-2" />
              View Live Site
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="text-sm">
              <Settings className="h-4 w-4 mr-2" />
              Site Frontend
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.totalQuotations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">₦{stats?.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Quotations</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.pendingQuotations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.orderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.orderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Responsive Admin Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <RovingFocusGroup.Root orientation="horizontal" loop>
              <div role="tablist" aria-label="Admin sections" className="space-y-2">
                <TabsList className="grid w-full grid-cols-7 gap-1">
                  {primaryTabs.map((tab) => (
                    <RovingFocusGroup.Item key={tab.id} asChild>
                      <TabsTrigger 
                        value={tab.id} 
                        className="text-xs"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`${tab.id}-tab`}
                      >
                        {tab.label}
                      </TabsTrigger>
                    </RovingFocusGroup.Item>
                  ))}
                </TabsList>
                <TabsList className="flex flex-wrap gap-1">
                  {[...secondaryTabs, ...managementTabs].map((tab) => (
                    <RovingFocusGroup.Item key={tab.id} asChild>
                      <TabsTrigger 
                        value={tab.id} 
                        className="text-xs px-3 py-1"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`${tab.id}-tab`}
                      >
                        {tab.label}
                      </TabsTrigger>
                    </RovingFocusGroup.Item>
                  ))}
                </TabsList>
              </div>
            </RovingFocusGroup.Root>
          </div>

          {/* Mobile/Tablet Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Admin Management</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    {[...primaryTabs, ...secondaryTabs, ...managementTabs].find(tab => tab.id === activeTab)?.label || 'Overview'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <ScrollArea className="h-80">
                    <RovingFocusGroup.Root orientation="vertical" loop>
                      <div className="space-y-1" role="menu">
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground" role="presentation">Primary</div>
                        {primaryTabs.map((tab) => (
                          <RovingFocusGroup.Item key={tab.id} asChild>
                            <DropdownMenuItem 
                              onClick={() => setActiveTab(tab.id)}
                              role="menuitem"
                              aria-current={activeTab === tab.id}
                            >
                              <tab.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                              {tab.label}
                            </DropdownMenuItem>
                          </RovingFocusGroup.Item>
                        ))}
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground" role="presentation">Configuration</div>
                        {secondaryTabs.map((tab) => (
                          <RovingFocusGroup.Item key={tab.id} asChild>
                            <DropdownMenuItem 
                              onClick={() => setActiveTab(tab.id)}
                              role="menuitem"
                              aria-current={activeTab === tab.id}
                            >
                              <tab.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                              {tab.label}
                            </DropdownMenuItem>
                          </RovingFocusGroup.Item>
                        ))}
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground" role="presentation">Management</div>
                        {managementTabs.map((tab) => (
                          <RovingFocusGroup.Item key={tab.id} asChild>
                            <DropdownMenuItem 
                              onClick={() => setActiveTab(tab.id)}
                              role="menuitem"
                              aria-current={activeTab === tab.id}
                            >
                              <tab.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                              {tab.label}
                            </DropdownMenuItem>
                          </RovingFocusGroup.Item>
                        ))}
                      </div>
                    </RovingFocusGroup.Root>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">Order #{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.profiles?.full_name} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{order.total_amount.toLocaleString()}</p>
                          <Badge className={getBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotations</CardTitle>
                  <CardDescription>Latest quotation requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentQuotations.slice(0, 3).map((quotation) => (
                      <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{quotation.products?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {quotation.profiles?.full_name} • Items: {quotation.items?.length || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(quotation.created_at).toLocaleDateString()}
                          </p>
                          <Badge className={getBadgeColor(quotation.status)}>
                            {quotation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <AdminSystemManager />
          </TabsContent>

          <TabsContent value="email">
            <AdminEmailManager />
          </TabsContent>

          <TabsContent value="security">
            <AdminSecurityCenter />
          </TabsContent>

          <TabsContent value="currency">
            <AdminCurrencyManager />
          </TabsContent>

          <TabsContent value="newsletter">
            <AdminNewsletterManager />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManager profileData={{
              ...user,
              full_name: user?.user_metadata?.full_name || '',
              role: userRole || 'user',
              user_id: user?.id || '',
              created_at: user?.created_at || '',
              updated_at: user?.updated_at || ''
            } as ProfileData} />
          </TabsContent>

          <TabsContent value="language">
            <AdminLanguageManager />
          </TabsContent>

          <TabsContent value="menus">
            <MenuManager />
          </TabsContent>

          <TabsContent value="assets">
            <AdminAssetManager />
          </TabsContent>

          <TabsContent value="themes">
            <AdminThemeManager />
          </TabsContent>

          <TabsContent value="chat">
            <AdminChatManager />
          </TabsContent>

          <TabsContent value="site">
            <AdminSiteManager />
          </TabsContent>

          <TabsContent value="content">
            <AdminContentManager />
          </TabsContent>

          <TabsContent value="products">
            <AdminProductManager />
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjectManager />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlogManager />
          </TabsContent>

          <TabsContent value="urls">
            <AdminURLManager />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrderManager />
          </TabsContent>

          <TabsContent value="quotations">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotations</CardTitle>
                <CardDescription>Latest quotation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentQuotations.map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{quotation?.products?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          {quotation?.profiles?.full_name || 'Unknown'} • Items: {quotation?.items?.length || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {quotation?.created_at ? new Date(quotation.created_at).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <Badge className={getBadgeColor(quotation.status)}>
                          {quotation?.status || 'unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
