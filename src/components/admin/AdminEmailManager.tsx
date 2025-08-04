import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Edit, Plus, Settings, Server, Eye, Save, TestTube } from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: any;
  is_active: boolean;
}

interface SMTPSettings {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  from_email: string;
  from_name: string;
  is_default: boolean;
  is_active: boolean;
}

const AdminEmailManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedSMTP, setSelectedSMTP] = useState<SMTPSettings | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSMTPDialogOpen, setIsSMTPDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailData();
  }, []);

  const fetchEmailData = async () => {
    try {
      const [templatesResult, smtpResult] = await Promise.all([
        supabase.from('email_templates').select('*').order('name'),
        supabase.from('smtp_settings').select('*').order('name')
      ]);

      if (templatesResult.error) throw templatesResult.error;
      if (smtpResult.error) throw smtpResult.error;

      setTemplates(templatesResult.data || []);
      setSMTPSettings(smtpResult.data || []);
    } catch (error) {
      console.error('Error fetching email data:', error);
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from('email_templates')
          .update(template as any)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(template as any);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Email template ${template.id ? 'updated' : 'created'} successfully`,
      });

      fetchEmailData();
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    }
  };

  const saveSMTPSettings = async (smtp: Partial<SMTPSettings>) => {
    try {
      if (smtp.id) {
        const { error } = await supabase
          .from('smtp_settings')
          .update(smtp as any)
          .eq('id', smtp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smtp_settings')
          .insert(smtp as any);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `SMTP settings ${smtp.id ? 'updated' : 'created'} successfully`,
      });

      fetchEmailData();
      setIsSMTPDialogOpen(false);
      setSelectedSMTP(null);
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP settings",
        variant: "destructive",
      });
    }
  };

  const testEmail = async (templateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-emails', {
        body: {
          to: 'test@example.com',
          template: templateId,
          data: {
            customer_name: 'Test User',
            company_name: 'EINSPOT',
            product_name: 'Test Product',
            order_number: 'TEST-001'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
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
          <h3 className="text-lg font-semibold">Email Management</h3>
          <p className="text-sm text-muted-foreground">Manage email templates and SMTP settings</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Email Templates</h4>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedTemplate(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTemplate ? 'Edit Template' : 'Add New Template'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or modify email templates with dynamic variables
                  </DialogDescription>
                </DialogHeader>
                <TemplateForm 
                  template={selectedTemplate} 
                  onSave={saveTemplate}
                  onCancel={() => setIsTemplateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.template_key}</CardDescription>
                    </div>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.subject}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsTemplateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testEmail(template.template_key)}
                    >
                      <TestTube className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">SMTP Settings</h4>
            <Dialog open={isSMTPDialogOpen} onOpenChange={setIsSMTPDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSMTP(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add SMTP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSMTP ? 'Edit SMTP Settings' : 'Add New SMTP Settings'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure SMTP server for sending emails
                  </DialogDescription>
                </DialogHeader>
                <SMTPForm 
                  smtp={selectedSMTP} 
                  onSave={saveSMTPSettings}
                  onCancel={() => setIsSMTPDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {smtpSettings.map((smtp) => (
              <Card key={smtp.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{smtp.name}</CardTitle>
                      <CardDescription>{smtp.from_email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={smtp.is_default ? "default" : "secondary"}>
                        {smtp.is_default ? "Default" : "Alternative"}
                      </Badge>
                      <Badge variant={smtp.is_active ? "default" : "secondary"}>
                        {smtp.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Host:</span>
                      <span>{smtp.host}:{smtp.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Encryption:</span>
                      <span className="uppercase">{smtp.encryption}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      setSelectedSMTP(smtp);
                      setIsSMTPDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TemplateForm = ({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: EmailTemplate | null;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    template_key: template?.template_key || '',
    name: template?.name || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    text_content: template?.text_content || '',
    variables: template?.variables || [],
    is_active: template?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(template && { id: template.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="template_key">Template Key</Label>
          <Input
            id="template_key"
            value={formData.template_key}
            onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
            placeholder="welcome, quote_confirmation, etc."
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Welcome Email"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Welcome to {{company_name}}"
          required
        />
      </div>

      <div>
        <Label htmlFor="html_content">HTML Content</Label>
        <Textarea
          id="html_content"
          value={formData.html_content}
          onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
          placeholder="<h1>Hello {{customer_name}}!</h1>"
          className="min-h-[200px] font-mono"
          required
        />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{{variable_name}}"} for dynamic content
                  </p>
      </div>

      <div>
        <Label htmlFor="text_content">Text Content (Optional)</Label>
        <Textarea
          id="text_content"
          value={formData.text_content}
          onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
          placeholder="Plain text version of your email"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active Template</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </form>
  );
};

const SMTPForm = ({ 
  smtp, 
  onSave, 
  onCancel 
}: { 
  smtp: SMTPSettings | null;
  onSave: (smtp: Partial<SMTPSettings>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: smtp?.name || '',
    host: smtp?.host || '',
    port: smtp?.port || 587,
    username: smtp?.username || '',
    password: smtp?.password || '',
    encryption: smtp?.encryption || 'tls',
    from_email: smtp?.from_email || '',
    from_name: smtp?.from_name || '',
    is_default: smtp?.is_default ?? false,
    is_active: smtp?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(smtp && { id: smtp.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Configuration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Gmail SMTP"
            required
          />
        </div>
        <div>
          <Label htmlFor="host">SMTP Host</Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="smtp.gmail.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
            placeholder="587"
            required
          />
        </div>
        <div>
          <Label htmlFor="encryption">Encryption</Label>
          <Select value={formData.encryption} onValueChange={(value) => setFormData({ ...formData, encryption: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tls">TLS</SelectItem>
              <SelectItem value="ssl">SSL</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="your-email@gmail.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password/App Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Your app password"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from_email">From Email</Label>
          <Input
            id="from_email"
            type="email"
            value={formData.from_email}
            onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
            placeholder="noreply@einspot.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="from_name">From Name</Label>
          <Input
            id="from_name"
            value={formData.from_name}
            onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
            placeholder="EINSPOT Engineering"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <Label htmlFor="is_default">Default SMTP</Label>
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
          <Save className="h-4 w-4 mr-2" />
          Save SMTP Settings
        </Button>
      </div>
    </form>
  );
};

export default AdminEmailManager;