import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, FileText, Clock, CheckCircle, XCircle, Eye, Download, User } from 'lucide-react';
import { trackBusinessEvent } from '@/components/AnalyticsProvider';
import { ProfileEditor } from './profile/ProfileEditor';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      image_url: string;
      category: string;
    };
  }[];
}

interface Quotation {
  id: string;
  status: string;
  message: string;
  quoted_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  admin_notes: string;
  products: {
    name: string;
    image_url: string;
    category: string;
    price: number;
  };
}

export const CustomerPortal = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user, fetchCustomerData]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Fetch orders with items and products
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url, category)
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch quotations with products
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          products (name, image_url, category, price)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (quotationsError) throw quotationsError;

      setOrders(ordersData || []);
      setQuotations(quotationsData || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (orderId: string) => {
    trackBusinessEvent.contactForm('order_view');
    // In a real app, this would navigate to order details page
    console.log('Viewing order:', orderId);
  };

  const handleDownloadInvoice = (orderNumber: string) => {
    trackBusinessEvent.contactForm('invoice_download');
    // In a real app, this would download the invoice
    console.log('Downloading invoice for:', orderNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <p className="text-muted-foreground">Track your orders and quotations</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="quotations">
            <FileText className="h-4 w-4 mr-2" />
            Quotations ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground text-center">
                  You haven't placed any orders yet. Browse our products to get started.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/products'}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        ₦{order.total_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.products.name}</p>
                              <p className="text-sm text-muted-foreground">{item.products.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Qty: {item.quantity}</p>
                              <p className="text-sm text-muted-foreground">
                                ₦{item.total_price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {order.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.order_number)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4">
          {quotations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Quotations Yet</h3>
                <p className="text-muted-foreground text-center">
                  You haven't requested any quotations yet. Get quotes for products you're interested in.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/products'}>
                  Request Quote
                </Button>
              </CardContent>
            </Card>
          ) : (
            quotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{quotation.products.name}</CardTitle>
                      <Badge className={getStatusColor(quotation.status)}>
                        {getStatusIcon(quotation.status)}
                        <span className="ml-1 capitalize">{quotation.status}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      {quotation.quoted_price ? (
                        <p className="text-lg font-semibold text-primary">
                          ₦{quotation.quoted_price.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Pending Quote</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={quotation.products.image_url}
                        alt={quotation.products.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{quotation.products.name}</p>
                        <p className="text-sm text-muted-foreground">{quotation.products.category}</p>
                        <p className="text-sm">Quantity: {quotation.quantity}</p>
                        {quotation.products.price && (
                          <p className="text-sm text-muted-foreground">
                            Base Price: ₦{quotation.products.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {quotation.message && (
                      <div>
                        <h5 className="font-medium mb-1">Your Message:</h5>
                        <p className="text-sm text-muted-foreground">{quotation.message}</p>
                      </div>
                    )}

                    {quotation.admin_notes && (
                      <div>
                        <h5 className="font-medium mb-1">Response:</h5>
                        <p className="text-sm text-muted-foreground">{quotation.admin_notes}</p>
                      </div>
                    )}

                    {quotation.status === 'approved' && quotation.quoted_price && (
                      <div className="flex justify-end">
                        <Button onClick={() => window.open(`https://wa.me/2348123647982?text=Hi, I'd like to proceed with my quote for ${quotation.products.name}`)}>
                          Proceed to Order
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <ProfileEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};