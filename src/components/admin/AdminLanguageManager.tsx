import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Languages, Edit, Plus, Globe, Star, Download, RotateCcw } from 'lucide-react';

interface LanguageSettings {
  id: string;
  language_code: string;
  language_name: string;
  is_default: boolean;
  is_active: boolean;
  auto_translate: boolean;
}

interface Translation {
  key: string;
  value: string;
  category: string;
}

const AdminLanguageManager = () => {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<LanguageSettings[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageSettings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Translation[]>>({});
  const [selectedTranslationLang, setSelectedTranslationLang] = useState('');
  const [loading, setLoading] = useState(true);

  const defaultTranslations = {
    navigation: [
      { key: 'nav.home', value: 'Home', category: 'navigation' },
      { key: 'nav.about', value: 'About', category: 'navigation' },
      { key: 'nav.products', value: 'Products', category: 'navigation' },
      { key: 'nav.services', value: 'Services', category: 'navigation' },
      { key: 'nav.projects', value: 'Projects', category: 'navigation' },
      { key: 'nav.contact', value: 'Contact', category: 'navigation' },
    ],
    common: [
      { key: 'common.loading', value: 'Loading...', category: 'common' },
      { key: 'common.save', value: 'Save', category: 'common' },
      { key: 'common.cancel', value: 'Cancel', category: 'common' },
      { key: 'common.delete', value: 'Delete', category: 'common' },
      { key: 'common.edit', value: 'Edit', category: 'common' },
      { key: 'common.add', value: 'Add', category: 'common' },
      { key: 'common.search', value: 'Search', category: 'common' },
      { key: 'common.filter', value: 'Filter', category: 'common' },
    ],
    buttons: [
      { key: 'button.get_quote', value: 'Get Quote', category: 'buttons' },
      { key: 'button.learn_more', value: 'Learn More', category: 'buttons' },
      { key: 'button.contact_us', value: 'Contact Us', category: 'buttons' },
      { key: 'button.view_details', value: 'View Details', category: 'buttons' },
      { key: 'button.download', value: 'Download', category: 'buttons' },
    ],
    forms: [
      { key: 'form.name', value: 'Name', category: 'forms' },
      { key: 'form.email', value: 'Email', category: 'forms' },
      { key: 'form.phone', value: 'Phone', category: 'forms' },
      { key: 'form.message', value: 'Message', category: 'forms' },
      { key: 'form.company', value: 'Company', category: 'forms' },
      { key: 'form.submit', value: 'Submit', category: 'forms' },
    ],
    status: [
      { key: 'status.pending', value: 'Pending', category: 'status' },
      { key: 'status.approved', value: 'Approved', category: 'status' },
      { key: 'status.rejected', value: 'Rejected', category: 'status' },
      { key: 'status.completed', value: 'Completed', category: 'status' },
      { key: 'status.in_progress', value: 'In Progress', category: 'status' },
    ]
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedTranslationLang) {
      loadTranslations(selectedTranslationLang);
    }
  }, [selectedTranslationLang]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_settings')
        .select('*')
        .order('is_default', { ascending: false })
        .order('language_name');

      if (error) throw error;
      setLanguages(data || []);
      
      // Set first active language for translations
      const firstActive = data?.find(lang => lang.is_active);
      if (firstActive && !selectedTranslationLang) {
        setSelectedTranslationLang(firstActive.language_code);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast({
        title: "Error",
        description: "Failed to load language settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTranslations = (languageCode: string) => {
    // For demo purposes, use default English translations
    // In production, this would load from a translations table or file
    setTranslations({ [languageCode]: Object.values(defaultTranslations).flat() });
  };

  const saveLanguage = async (language: Partial<LanguageSettings>) => {
    try {
      if (language.id) {
        const { error } = await supabase
          .from('language_settings')
          .update(language as any)
          .eq('id', language.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('language_settings')
          .insert(language as any);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Language ${language.id ? 'updated' : 'added'} successfully`,
      });

      fetchLanguages();
      setIsDialogOpen(false);
      setSelectedLanguage(null);
    } catch (error) {
      console.error('Error saving language:', error);
      toast({
        title: "Error",
        description: "Failed to save language settings",
        variant: "destructive",
      });
    }
  };

  const setDefaultLanguage = async (languageId: string) => {
    try {
      // First, remove default from all languages
      await supabase
        .from('language_settings')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then set the selected language as default
      const { error } = await supabase
        .from('language_settings')
        .update({ is_default: true })
        .eq('id', languageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default language updated successfully",
      });

      fetchLanguages();
    } catch (error) {
      console.error('Error setting default language:', error);
      toast({
        title: "Error",
        description: "Failed to set default language",
        variant: "destructive",
      });
    }
  };

  const autoTranslate = async (targetLanguage: string) => {
    try {
      // Mock auto-translation - in production, this would call Google Translate API
      const sourceTranslations = translations['en'] || Object.values(defaultTranslations).flat();
      const translatedValues = sourceTranslations.map(t => ({
        ...t,
        value: `[${targetLanguage.toUpperCase()}] ${t.value}` // Mock translation
      }));

      setTranslations(prev => ({
        ...prev,
        [targetLanguage]: translatedValues
      }));

      toast({
        title: "Auto-Translation Complete",
        description: `Translations generated for ${targetLanguage.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error auto-translating:', error);
      toast({
        title: "Error",
        description: "Failed to auto-translate content",
        variant: "destructive",
      });
    }
  };

  const exportTranslations = (languageCode: string) => {
    const translations_data = translations[languageCode] || [];
    const exportData = {};
    
    translations_data.forEach(t => {
      exportData[t.key] = t.value;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${languageCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h3 className="text-lg font-semibold">Language Management</h3>
          <p className="text-sm text-muted-foreground">Manage languages and translations</p>
        </div>
      </div>

      <Tabs defaultValue="languages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Available Languages</h4>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedLanguage(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedLanguage ? 'Edit Language' : 'Add New Language'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure language settings and auto-translation
                  </DialogDescription>
                </DialogHeader>
                <LanguageForm 
                  language={selectedLanguage} 
                  onSave={saveLanguage}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {languages.map((language) => (
              <Card key={language.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {language.language_name}
                        {language.is_default && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {language.language_code.toUpperCase()}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={language.is_active ? "default" : "secondary"}>
                        {language.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {language.auto_translate && (
                        <Badge variant="outline">
                          Auto-Translate
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLanguage(language);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {!language.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDefaultLanguage(language.id)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    {language.auto_translate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => autoTranslate(language.language_code)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Translation Management</h4>
            <div className="flex gap-2">
              <Select value={selectedTranslationLang} onValueChange={setSelectedTranslationLang}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.filter(lang => lang.is_active).map(lang => (
                    <SelectItem key={lang.id} value={lang.language_code}>
                      {lang.language_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTranslationLang && (
                <Button 
                  variant="outline" 
                  onClick={() => exportTranslations(selectedTranslationLang)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {selectedTranslationLang && (
            <div className="space-y-4">
              {Object.entries(defaultTranslations).map(([category, categoryTranslations]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{category}</CardTitle>
                    <CardDescription>
                      {categoryTranslations.length} translation keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryTranslations.map((translation) => (
                        <div key={translation.key} className="grid grid-cols-2 gap-4 items-center">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              {translation.key}
                            </Label>
                          </div>
                          <Input
                            value={
                              translations[selectedTranslationLang]?.find(t => t.key === translation.key)?.value || 
                              translation.value
                            }
                            onChange={(e) => {
                              setTranslations(prev => ({
                                ...prev,
                                [selectedTranslationLang]: (prev[selectedTranslationLang] || []).map(t => 
                                  t.key === translation.key ? { ...t, value: e.target.value } : t
                                )
                              }));
                            }}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const LanguageForm = ({ 
  language, 
  onSave, 
  onCancel 
}: { 
  language: LanguageSettings | null;
  onSave: (language: Partial<LanguageSettings>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    language_code: language?.language_code || '',
    language_name: language?.language_name || '',
    is_default: language?.is_default ?? false,
    is_active: language?.is_active ?? true,
    auto_translate: language?.auto_translate ?? false
  });

  const commonLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'hi', name: 'Hindi' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(language && { id: language.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language_code">Language Code</Label>
          <Select 
            value={formData.language_code} 
            onValueChange={(value) => {
              const selected = commonLanguages.find(l => l.code === value);
              setFormData({ 
                ...formData, 
                language_code: value,
                language_name: selected?.name || formData.language_name
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {commonLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.code.toUpperCase()} - {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="language_name">Language Name</Label>
          <Input
            id="language_name"
            value={formData.language_name}
            onChange={(e) => setFormData({ ...formData, language_name: e.target.value })}
            placeholder="English"
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
          <Label htmlFor="is_default">Default Language</Label>
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

      <div className="flex items-center space-x-2">
        <Switch
          id="auto_translate"
          checked={formData.auto_translate}
          onCheckedChange={(checked) => setFormData({ ...formData, auto_translate: checked })}
        />
        <Label htmlFor="auto_translate">Enable Auto-Translation</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Language
        </Button>
      </div>
    </form>
  );
};

export default AdminLanguageManager;