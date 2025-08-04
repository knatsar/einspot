
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Clock, 
  Trash2,
  RefreshCw
} from 'lucide-react';

type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

interface AdminInvitation {
  id: string;
  email: string;
  invited_by: string;
  invited_at: string;
  accepted_at: string | null;
  expires_at: string;
  status: InvitationStatus;
}

interface AuditLog {
  id: string;
  user_id: string;
  old_role: string;
  new_role: string;
  changed_by: string;
  changed_at: string;
  reason: string;
}

const AdminSecurityManager = () => {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [inviteReason, setInviteReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
    fetchAuditLogs();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvitations((data || []).map(item => ({
        ...item,
        status: item.status as InvitationStatus
      })));
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleInviteAdmin = async () => {
    if (!newInviteEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_invitations')
        .insert({
          email: newInviteEmail.trim(),
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setNewInviteEmail('');
      setInviteReason('');
      await fetchInvitations();
      
      toast({
        title: "Success",
        description: "Admin invitation sent successfully"
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send admin invitation",
        variant: "destructive"
      });
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_invitations')
        .update({ status: 'revoked' })
        .eq('id', id);

      if (error) throw error;
      await fetchInvitations();
      
      toast({
        title: "Success",
        description: "Invitation revoked successfully"
      });
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
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
          <h2 className="text-2xl font-bold tracking-tight">Security Management</h2>
          <p className="text-muted-foreground">Manage admin access and security settings</p>
        </div>
      </div>

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">Admin Invitations</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Admin Invitation</CardTitle>
              <CardDescription>
                Invite new administrators to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={inviteReason}
                    onChange={(e) => setInviteReason(e.target.value)}
                    placeholder="System administrator"
                  />
                </div>
              </div>
              <Button onClick={handleInviteAdmin} disabled={!newInviteEmail.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage admin invitations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No invitations found</p>
                ) : (
                  invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited {formatDate(invitation.invited_at)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {formatDate(invitation.expires_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(invitation.status)}
                        {invitation.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Change Audit Log</CardTitle>
              <CardDescription>
                Track all role changes and administrative actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No audit logs found</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Role changed: {log.old_role} → {log.new_role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            User: {log.user_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Changed by: {log.changed_by}
                          </p>
                          {log.reason && (
                            <p className="text-sm text-muted-foreground">
                              Reason: {log.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {formatDate(log.changed_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Security settings are automatically enforced by the system. Contact your system administrator for changes.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Row Level Security (RLS)</Label>
                    <p className="text-sm text-muted-foreground">
                      Database access control is enforced
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Function Security</Label>
                    <p className="text-sm text-muted-foreground">
                      Database functions use security definer
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Invitation System</Label>
                    <p className="text-sm text-muted-foreground">
                      Secure admin role assignment
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurityManager;
