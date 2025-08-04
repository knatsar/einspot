import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface NewsletterSubscriptionProps {
  className?: string;
}

const NewsletterSubscription = ({ className = "" }: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        if (existingSubscriber.status === 'active') {
          toast({
            title: "Already Subscribed",
            description: "You're already subscribed to our newsletter!",
          });
        } else {
          // Reactivate subscription
          await supabase
            .from('newsletter_subscribers')
            .update({ 
              status: 'active', 
              subscribed_at: new Date().toISOString(),
              unsubscribed_at: null 
            })
            .eq('id', existingSubscriber.id);
          
          setSubscribed(true);
          toast({
            title: "Welcome Back!",
            description: "Your newsletter subscription has been reactivated.",
          });
        }
      } else {
        // New subscription
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email, source: 'website' }]);

        if (error) {
          throw error;
        }

        setSubscribed(true);
        toast({
          title: "Thank You!",
          description: "You've successfully subscribed to our newsletter for the latest energy insights and company updates.",
        });
      }

      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`bg-card border rounded-lg p-6 text-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              You've successfully subscribed to our newsletter. We'll keep you updated with the latest energy insights and company updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h3>
        <p className="text-muted-foreground">
          Subscribe to our newsletter for the latest energy insights and company updates.
        </p>
      </div>
      
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading || !email}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        By subscribing, you agree to our Privacy Policy and consent to receive updates.
      </p>
    </div>
  );
};

export default NewsletterSubscription;