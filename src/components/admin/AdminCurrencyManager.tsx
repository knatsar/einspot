import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Edit, Plus, TrendingUp, RefreshCw, Star } from 'lucide-react';

interface CurrencySettings {
  id: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  symbol_position: string;
  exchange_rate: number;
  is_default: boolean;
  is_active: boolean;
}

const AdminCurrencyManager = () => {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<CurrencySettings[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencySettings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currency_settings')
        .select('*')
        .order('is_default', { ascending: false })
        .order('currency_name');

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast({
        title: "Error",
        description: "Failed to load currency settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrency = async (currency: Partial<CurrencySettings>) => {
    try {
      if (currency.id) {
        const { error } = await supabase
          .from('currency_settings')
          .update(currency as any)
          .eq('id', currency.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('currency_settings')
          .insert(currency as any);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Currency ${currency.id ? 'updated' : 'added'} successfully`,
      });

      fetchCurrencies();
      setIsDialogOpen(false);
      setSelectedCurrency(null);
    } catch (error) {
      console.error('Error saving currency:', error);
      toast({
        title: "Error",
        description: "Failed to save currency settings",
        variant: "destructive",
      });
    }
  };

  const setDefaultCurrency = async (currencyId: string) => {
    try {
      // First, remove default from all currencies
      await supabase
        .from('currency_settings')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then set the selected currency as default
      const { error } = await supabase
        .from('currency_settings')
        .update({ is_default: true })
        .eq('id', currencyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default currency updated successfully",
      });

      fetchCurrencies();
    } catch (error) {
      console.error('Error setting default currency:', error);
      toast({
        title: "Error",
        description: "Failed to set default currency",
        variant: "destructive",
      });
    }
  };

  const updateExchangeRates = async () => {
    setUpdating(true);
    try {
      // Mock exchange rate update - in production, this would call an API
      const defaultCurrency = currencies.find(c => c.is_default);
      if (!defaultCurrency) {
        throw new Error('No default currency found');
      }

      // Mock rates relative to NGN
      const mockRates = {
        'USD': 0.0013,
        'EUR': 0.0012,
        'GBP': 0.0010,
        'NGN': 1.0
      };

      for (const currency of currencies) {
        if (currency.currency_code !== defaultCurrency.currency_code) {
          const rate = mockRates[currency.currency_code as keyof typeof mockRates] || currency.exchange_rate;
          await supabase
            .from('currency_settings')
            .update({ exchange_rate: rate })
            .eq('id', currency.id);
        }
      }

      toast({
        title: "Success",
        description: "Exchange rates updated successfully",
      });

      fetchCurrencies();
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      toast({
        title: "Error",
        description: "Failed to update exchange rates",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number, currency: CurrencySettings) => {
    const formattedAmount = amount.toLocaleString();
    return currency.symbol_position === 'left' 
      ? `${currency.currency_symbol}${formattedAmount}`
      : `${formattedAmount}${currency.currency_symbol}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Currency Management</h3>
          <p className="text-sm text-muted-foreground">Manage currencies and exchange rates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={updateExchangeRates}
            disabled={updating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            Update Rates
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedCurrency(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedCurrency ? 'Edit Currency' : 'Add New Currency'}
                </DialogTitle>
                <DialogDescription>
                  Configure currency settings and exchange rates
                </DialogDescription>
              </DialogHeader>
              <CurrencyForm 
                currency={selectedCurrency} 
                onSave={saveCurrency}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currencies.map((currency) => (
          <Card key={currency.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {currency.currency_name}
                    {currency.is_default && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currency.currency_code} • {currency.currency_symbol}
                  </CardDescription>
                </div>
                <Badge variant={currency.is_active ? "default" : "secondary"}>
                  {currency.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Exchange Rate:</span>
                  <span className="font-mono text-sm">{currency.exchange_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Symbol Position:</span>
                  <span className="text-sm capitalize">{currency.symbol_position}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Example: </span>
                  <span className="font-medium">
                    {formatCurrency(1000, currency)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCurrency(currency);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!currency.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultCurrency(currency.id)}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exchange Rate Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Exchange Rate Information
          </CardTitle>
          <CardDescription>
            Currency conversion rates and formatting preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Default Currency</h4>
              <p className="text-sm text-muted-foreground">
                {currencies.find(c => c.is_default)?.currency_name || 'None set'} - 
                All prices are stored relative to this currency
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Active Currencies</h4>
              <p className="text-sm text-muted-foreground">
                {currencies.filter(c => c.is_active).length} of {currencies.length} currencies 
                are currently active and available for customers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CurrencyForm = ({ 
  currency, 
  onSave, 
  onCancel 
}: { 
  currency: CurrencySettings | null;
  onSave: (currency: Partial<CurrencySettings>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    currency_code: currency?.currency_code || '',
    currency_name: currency?.currency_name || '',
    currency_symbol: currency?.currency_symbol || '',
    symbol_position: currency?.symbol_position || 'left' as 'left' | 'right',
    exchange_rate: currency?.exchange_rate || 1.0,
    is_default: currency?.is_default ?? false,
    is_active: currency?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(currency && { id: currency.id })
    });
  };

  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toLocaleString();
    return formData.symbol_position === 'left' 
      ? `${formData.currency_symbol}${formattedAmount}`
      : `${formattedAmount}${formData.currency_symbol}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency_code">Currency Code</Label>
          <Input
            id="currency_code"
            value={formData.currency_code}
            onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
            placeholder="USD"
            maxLength={3}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency_name">Currency Name</Label>
          <Input
            id="currency_name"
            value={formData.currency_name}
            onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
            placeholder="US Dollar"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency_symbol">Currency Symbol</Label>
          <Input
            id="currency_symbol"
            value={formData.currency_symbol}
            onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
            placeholder="$"
            required
          />
        </div>
        <div>
          <Label htmlFor="symbol_position">Symbol Position</Label>
          <Select 
            value={formData.symbol_position} 
            onValueChange={(value: 'left' | 'right') => setFormData({ ...formData, symbol_position: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left ($1,000)</SelectItem>
              <SelectItem value="right">Right (1,000$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="exchange_rate">Exchange Rate</Label>
        <Input
          id="exchange_rate"
          type="number"
          step="0.0001"
          value={formData.exchange_rate}
          onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 0 })}
          placeholder="1.0000"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Rate relative to default currency
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <Label className="text-sm font-medium">Preview</Label>
        <p className="text-lg font-semibold mt-1">
          {formatCurrency(1000)}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <Label htmlFor="is_default">Default Currency</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Currency
        </Button>
      </div>
    </form>
  );
};

export default AdminCurrencyManager;