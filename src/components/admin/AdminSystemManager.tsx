import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Shield, 
  Activity, 
  MessageSquare, 
  BarChart3, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface BackupLog {
  id: string;
  backup_type: string;
  status: string;
  metadata: any;
  error_message?: string;
  created_at: string;
}

interface HealthLog {
  id: string;
  status: string;
  metadata: any;
  created_at: string;
}

interface WhatsAppMessage {
  id: string;
  phone_number: string;
  message: string;
  contact_name?: string;
  status: string;
  created_at: string;
}

export const AdminSystemManager = () => {
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      // Fetch backup logs
      const { data: backups } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch health logs
      const { data: health } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch WhatsApp messages
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch analytics summary
      const { data: analyticsData } = await supabase.functions.invoke('analytics', {
        method: 'GET'
      });

      setBackupLogs(backups || []);
      setHealthLogs(health || []);
      setWhatsappMessages(messages || []);
      setAnalytics(analyticsData?.summary);
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async () => {
    setActionLoading('backup');
    try {
      const { data } = await supabase.functions.invoke('backup-system', {
        body: { action: 'backup_database' }
      });
      
      if (data?.success) {
        await fetchSystemData();
        alert('Database backup completed successfully!');
      } else {
        alert('Backup failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Backup error:', error);
      alert('Backup failed: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const checkHealth = async () => {
    setActionLoading('health');
    try {
      const { data } = await supabase.functions.invoke('backup-system', {
        body: { action: 'system_health' }
      });
      
      if (data?.success) {
        await fetchSystemData();
        const health = data.health;
        const status = health.issues.length === 0 ? 'healthy' : 'warning';
        alert(`System Status: ${status.toUpperCase()}\nIssues: ${health.issues.join(', ') || 'None'}`);
      } else {
        alert('Health check failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Health check error:', error);
      alert('Health check failed: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">System Management</h2>
        <div className="flex gap-2">
          <Button 
            onClick={performBackup}
            disabled={actionLoading === 'backup'}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {actionLoading === 'backup' ? 'Backing up...' : 'Backup Database'}
          </Button>
          <Button 
            onClick={checkHealth}
            disabled={actionLoading === 'health'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {actionLoading === 'health' ? 'Checking...' : 'Health Check'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {backupLogs[0] && getStatusIcon(backupLogs[0].status)}
                  <div className="text-2xl font-bold">
                    {backupLogs[0]?.status || 'None'}
                  </div>
                </div>
                {backupLogs[0] && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(backupLogs[0].created_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {healthLogs[0] && getStatusIcon(healthLogs[0].status)}
                  <div className="text-2xl font-bold">
                    {healthLogs[0]?.status || 'Unknown'}
                  </div>
                </div>
                {healthLogs[0] && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(healthLogs[0].created_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{whatsappMessages.length}</div>
                <p className="text-xs text-muted-foreground">
                  Recent messages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quote Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.quote_requests || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Backups
              </CardTitle>
              <CardDescription>
                Recent database backup history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backupLogs.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(backup.status)}
                      <div>
                        <p className="font-medium">Database Backup</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(backup.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>
                        {backup.status}
                      </Badge>
                      {backup.metadata?.total_records && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {backup.metadata.total_records} records
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Monitoring
              </CardTitle>
              <CardDescription>
                System health checks and monitoring logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthLogs.map((health) => (
                  <div key={health.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(health.status)}
                      <div>
                        <p className="font-medium">Health Check</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(health.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={health.status === 'healthy' ? 'default' : 'secondary'}>
                        {health.status}
                      </Badge>
                      {health.metadata?.issues && health.metadata.issues.length > 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          {health.metadata.issues.length} issues
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Messages
              </CardTitle>
              <CardDescription>
                Recent WhatsApp business messages and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {whatsappMessages.map((message) => (
                  <div key={message.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{message.phone_number}</Badge>
                        {message.contact_name && (
                          <span className="text-sm font-medium">{message.contact_name}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Summary
              </CardTitle>
              <CardDescription>
                Business metrics and user analytics (Last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Page Views</h4>
                    <p className="text-2xl font-bold">{analytics.page_views}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Quote Requests</h4>
                    <p className="text-2xl font-bold">{analytics.quote_requests}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Product Views</h4>
                    <p className="text-2xl font-bold">{analytics.product_views}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">WhatsApp Clicks</h4>
                    <p className="text-2xl font-bold">{analytics.whatsapp_clicks}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Contact Forms</h4>
                    <p className="text-2xl font-bold">{analytics.contact_forms}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No analytics data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};