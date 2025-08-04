
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  DollarSign, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paystack' | 'flutterwave' | 'razorpay' | 'paypal';
  is_active: boolean;
  is_default: boolean;
  configuration: {
    public_key?: string;
    secret_key?: string;
    webhook_secret?: string;
    environment?: 'sandbox' | 'live';
    supported_currencies?: string[];
    fees?: {
      percentage: number;
      fixed: number;
    };
  };
  created_at: string;
  updated_at: string;
}

const AdminPaymentGatewayManager = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const gatewayTypes = [
    { value: 'stripe', label: 'Stripe', icon: '💳' },
    { value: 'paystack', label: 'Paystack', icon: '🇳🇬' },
    { value: 'flutterwave', label: 'Flutterwave', icon: '🌍' },
    { value: 'razorpay', label: 'Razorpay', icon: '🇮🇳' },
    { value: 'paypal', label: 'PayPal', icon: '💙' },
  ];

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedGateways: PaymentGateway[] = (data || []).map((gateway: any) => ({
        id: gateway.id,
        name: gateway.name,
        type: gateway.type,
        is_active: gateway.is_active,
        is_default: gateway.is_default,
        configuration: gateway.configuration || {},
        created_at: gateway.created_at,
        updated_at: gateway.updated_at
      }));

      setGateways(transformedGateways);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment gateways",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGateway = async (gateway: Partial<PaymentGateway>) => {
    try {
      if (gateway.id) {
        const { error } = await supabase
          .from('payment_gateways')
          .update({
            name: gateway.name,
            type: gateway.type,
            is_active: gateway.is_active,
            is_default: gateway.is_default,
            configuration: gateway.configuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', gateway.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_gateways')
          .insert({
            name: gateway.name,
            type: gateway.type,
            is_active: gateway.is_active,
            is_default: gateway.is_default,
            configuration: gateway.configuration,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      }

      await fetchGateways();
      setEditingGateway(null);
      toast({
        title: "Success",
        description: `Payment gateway ${gateway.id ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      toast({
        title: "Error",
        description: "Failed to save payment gateway",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGateway = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;

    try {
      const { error } = await supabase
        .from('payment_gateways')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchGateways();
      toast({
        title: "Success",
        description: "Payment gateway deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment gateway",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Remove default from all gateways
      await supabase
        .from('payment_gateways')
        .update({ is_default: false });

      // Set new default
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      await fetchGateways();
      toast({
        title: "Success",
        description: "Default payment gateway updated"
      });
    } catch (error) {
      console.error('Error setting default gateway:', error);
      toast({
        title: "Error",
        description: "Failed to set default gateway",
        variant: "destructive"
      });
    }
  };

  const toggleSecretVisibility = (gatewayId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Gateways</h2>
          <p className="text-muted-foreground">Configure and manage payment processing systems</p>
        </div>
        <Button onClick={() => setEditingGateway({ 
          id: '', 
          name: '', 
          type: 'stripe', 
          is_active: true, 
          is_default: false,
          configuration: {},
          created_at: '',
          updated_at: ''
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <div className="grid gap-4">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {gatewayTypes.find(gt => gt.value === gateway.type)?.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <CardDescription>{gateway.type.charAt(0).toUpperCase() + gateway.type.slice(1)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {gateway.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Badge variant={gateway.is_active ? "default" : "secondary"}>
                        {gateway.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Environment</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {gateway.configuration.environment || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Supported Currencies</Label>
                      <p className="text-sm text-muted-foreground">
                        {gateway.configuration.supported_currencies?.join(', ') || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Public Key</Label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground font-mono">
                          {gateway.configuration.public_key ? 
                            (showSecrets[gateway.id] ? 
                              gateway.configuration.public_key : 
                              maskSecret(gateway.configuration.public_key)
                            ) : 
                            'Not set'
                          }
                        </p>
                        {gateway.configuration.public_key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(gateway.id)}
                          >
                            {showSecrets[gateway.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex items-center space-x-2">
                        {gateway.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {gateway.is_active ? 'Ready for transactions' : 'Configuration required'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingGateway(gateway)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {!gateway.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(gateway.id)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGateway(gateway.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Payment Settings</CardTitle>
              <CardDescription>Configure global payment processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeout">Transaction Timeout (minutes)</Label>
                  <Input type="number" defaultValue="15" min="5" max="60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">+0.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3s</div>
                <p className="text-xs text-muted-foreground">-0.2s from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {editingGateway && (
        <GatewayEditModal
          gateway={editingGateway}
          onSave={handleSaveGateway}
          onCancel={() => setEditingGateway(null)}
        />
      )}
    </div>
  );
};

const GatewayEditModal = ({ 
  gateway, 
  onSave, 
  onCancel 
}: { 
  gateway: PaymentGateway; 
  onSave: (gateway: Partial<PaymentGateway>) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState(gateway);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const gatewayTypes = [
    { value: 'stripe', label: 'Stripe' },
    { value: 'paystack', label: 'Paystack' },
    { value: 'flutterwave', label: 'Flutterwave' },
    { value: 'razorpay', label: 'Razorpay' },
    { value: 'paypal', label: 'PayPal' },
  ];

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gateway.id ? 'Edit' : 'Add'} Payment Gateway</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Gateway Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Gateway Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gatewayTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="public_key">Public Key</Label>
                <Input
                  id="public_key"
                  type="password"
                  value={formData.configuration.public_key || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuration: { ...formData.configuration, public_key: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  type="password"
                  value={formData.configuration.secret_key || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuration: { ...formData.configuration, secret_key: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="webhook_secret">Webhook Secret</Label>
              <Input
                id="webhook_secret"
                type="password"
                value={formData.configuration.webhook_secret || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  configuration: { ...formData.configuration, webhook_secret: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.configuration.environment || 'sandbox'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  configuration: { ...formData.configuration, environment: value as 'sandbox' | 'live' }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currencies">Supported Currencies (comma-separated)</Label>
              <Input
                id="currencies"
                value={formData.configuration.supported_currencies?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  configuration: { 
                    ...formData.configuration, 
                    supported_currencies: e.target.value.split(',').map(c => c.trim())
                  }
                })}
                placeholder="USD, EUR, NGN, GBP"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                />
                <Label htmlFor="is_default">Default Gateway</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {gateway.id ? 'Update' : 'Create'} Gateway
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPaymentGatewayManager;
