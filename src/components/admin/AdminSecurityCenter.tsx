import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AUTH_CONFIG } from '@/lib/auth-config';

interface Session {
  id: string;
  user_id: string;
  created_at: string;
  last_active: string;
  expires_at: string;
}

interface AdminSettings {
  sessionTimeout: number;
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
}

export function AdminSecurityCenter() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    sessionTimeout: AUTH_CONFIG.SESSION_TIMEOUT / (60 * 1000), // Convert to minutes
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchSettings();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch active sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          sessionTimeout: data.session_timeout_minutes,
          requireEmailVerification: data.require_email_verification,
          maxLoginAttempts: data.max_login_attempts,
          passwordExpiryDays: data.password_expiry_days,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          session_timeout_minutes: settings.sessionTimeout,
          require_email_verification: settings.requireEmailVerification,
          max_login_attempts: settings.maxLoginAttempts,
          password_expiry_days: settings.passwordExpiryDays,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session terminated successfully",
      });

      fetchSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Center</h2>
          <p className="text-muted-foreground">
            Manage security settings and active sessions
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure security policies and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      maxLoginAttempts: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      requireEmailVerification: checked
                    })}
                  />
                  <Label htmlFor="requireEmailVerification">
                    Require Email Verification
                  </Label>
                </div>

                <div>
                  <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiryDays"
                    type="number"
                    value={settings.passwordExpiryDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordExpiryDays: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                View and manage user sessions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">User ID: {session.user_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(session.expires_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => terminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No active sessions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
