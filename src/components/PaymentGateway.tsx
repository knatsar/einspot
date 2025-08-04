import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Smartphone, DollarSign, Shield } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  metadata?: Record<string, any>;
}

export const PaymentGateway = ({ 
  amount, 
  currency = 'NGN', 
  onSuccess, 
  onError,
  metadata = {} 
}: PaymentGatewayProps) => {
  const [selectedGateway, setSelectedGateway] = useState('paystack');
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const paymentGateways = [
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Pay with card, bank transfer, or USSD',
      icon: <CreditCard className="h-5 w-5" />,
      currencies: ['NGN', 'USD', 'GHS', 'ZAR']
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Multiple payment options available',
      icon: <Smartphone className="h-5 w-5" />,
      currencies: ['NGN', 'USD', 'EUR', 'GBP']
    }
  ];

  const initializePayment = async () => {
    if (!customerEmail || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-integration', {
        body: {
          action: 'initialize',
          email: customerEmail,
          amount: amount,
          currency: currency,
          payment_method: selectedGateway,
          metadata: {
            customer_name: customerName,
            user_id: user?.id,
            ...metadata
          },
          callback_url: `${window.location.origin}/payment/callback`
        }
      });

      if (error) throw error;

      if (data.success) {
        // Redirect to payment page
        if (selectedGateway === 'paystack') {
          window.location.href = data.data.authorization_url;
        } else if (selectedGateway === 'flutterwave') {
          window.location.href = data.data.link;
        }
      } else {
        throw new Error(data.error || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('payment-integration', {
        body: {
          action: 'verify',
          reference: reference,
          payment_method: selectedGateway
        }
      });

      if (error) throw error;

      if (data.success && data.data.status === 'success') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
        onSuccess?.(data.data);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Could not verify payment",
        variant: "destructive",
      });
      onError?.(error);
    }
  };

  // Check for payment callback on component mount
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('tx_ref');
    
    if (reference) {
      verifyPayment(reference);
    }
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Amount to Pay</p>
          <p className="text-2xl font-bold text-primary">
            {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency}
            {amount.toLocaleString()}
          </p>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Payment Gateway Selection */}
        <div>
          <Label>Select Payment Method</Label>
          <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway} className="mt-2">
            {paymentGateways.map((gateway) => (
              <div key={gateway.id} className="flex items-center space-x-2">
                <RadioGroupItem value={gateway.id} id={gateway.id} />
                <Label 
                  htmlFor={gateway.id} 
                  className="flex items-center gap-3 cursor-pointer flex-1 p-3 border rounded-lg hover:bg-accent"
                >
                  {gateway.icon}
                  <div>
                    <p className="font-medium">{gateway.name}</p>
                    <p className="text-sm text-muted-foreground">{gateway.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-800">Secure Payment</p>
            <p className="text-green-700">Your payment information is encrypted and secure</p>
          </div>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={initializePayment}
          disabled={loading || !customerEmail || !customerName}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Processing...
            </>
          ) : (
            `Pay ${currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency}${amount.toLocaleString()}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentGateway;