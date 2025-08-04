import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Users, 
  Send, 
  Trash2, 
  Download,
  Eye,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  source: string;
}

const AdminNewsletterManager = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [bulkEmailDialog, setBulkEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = subscribers.length;
    const active = subscribers.filter(s => s.status === 'active').length;
    const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed').length;
    return { total, active, unsubscribed };
  };

  const stats = getStats();

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          status: 'unsubscribed', 
          unsubscribed_at: new Date().toISOString() 
        })
        .eq('id', subscriberId);

      if (error) throw error;

      await fetchSubscribers();
      toast({
        title: "Success",
        description: "Subscriber has been unsubscribed",
      });
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe user",
        variant: "destructive",
      });
    }
  };

  const handleResubscribe = async (subscriberId: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          status: 'active', 
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString()
        })
        .eq('id', subscriberId);

      if (error) throw error;

      await fetchSubscribers();
      toast({
        title: "Success",
        description: "Subscriber has been reactivated",
      });
    } catch (error: any) {
      console.error('Error resubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscriber",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to permanently delete this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) throw error;

      await fetchSubscribers();
      toast({
        title: "Success",
        description: "Subscriber has been deleted",
      });
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const handleBulkEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast({
        title: "Error",
        description: "Please fill in both subject and content",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      // Get active subscribers (or selected ones if any)
      let targetEmails: string[];
      
      if (selectedSubscribers.length > 0) {
        targetEmails = subscribers
          .filter(s => selectedSubscribers.includes(s.id) && s.status === 'active')
          .map(s => s.email);
      } else {
        targetEmails = subscribers
          .filter(s => s.status === 'active')
          .map(s => s.email);
      }

      if (targetEmails.length === 0) {
        toast({
          title: "No Recipients",
          description: "No active subscribers found to send emails to",
          variant: "destructive",
        });
        return;
      }

      // Call the send-emails edge function for bulk sending
      const { data, error } = await supabase.functions.invoke('send-emails', {
        body: {
          recipients: targetEmails,
          subject: emailSubject,
          html: emailContent.replace(/\n/g, '<br>'),
          template: 'custom',
          data: {
            subject: emailSubject,
            content: emailContent.replace(/\n/g, '<br>')
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Newsletter sent to ${targetEmails.length} subscribers!`,
      });

      setBulkEmailDialog(false);
      setEmailSubject('');
      setEmailContent('');
      setSelectedSubscribers([]);
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => s.status === 'active');
    const csv = [
      'Email,Status,Subscribed Date,Source',
      ...activeSubscribers.map(s => 
        `${s.email},${s.status},${new Date(s.subscribed_at).toLocaleDateString()},${s.source}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-1">
              <Search className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Dialog open={bulkEmailDialog} onOpenChange={setBulkEmailDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Newsletter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Newsletter subject..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Newsletter content..."
                      rows={10}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSubscribers.length > 0 
                      ? `Will send to ${selectedSubscribers.length} selected subscribers`
                      : `Will send to all ${stats.active} active subscribers`
                    }
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleBulkEmail} disabled={sending}>
                      {sending ? 'Sending...' : 'Send Newsletter'}
                    </Button>
                    <Button variant="outline" onClick={() => setBulkEmailDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={exportSubscribers}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Subscribers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscribers(filteredSubscribers.map(s => s.id));
                        } else {
                          setSelectedSubscribers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                          } else {
                            setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(subscriber.subscribed_at).toLocaleDateString()}</TableCell>
                    <TableCell>{subscriber.source}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {subscriber.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnsubscribe(subscriber.id)}
                          >
                            <EyeOff className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResubscribe(subscriber.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(subscriber.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNewsletterManager;