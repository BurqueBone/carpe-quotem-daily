import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  Smartphone, 
  Monitor,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  description?: string;
  is_active: boolean;
}

interface TemplateVariable {
  id: string;
  variable_name: string;
  display_name: string;
  description: string | null;
  category: 'system' | 'user' | 'content' | 'custom';
  data_type: 'text' | 'url' | 'date' | 'boolean' | 'number';
  default_value: string | null;
  is_system: boolean;
  is_active: boolean;
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: (templateData: any) => void;
  onCancel: () => void;
}

const EmailTemplateEditor = ({ template, onSave, onCancel }: EmailTemplateEditorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    description: template?.description || '',
    is_active: template?.is_active ?? true,
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(true);
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([]);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchTemplateVariables();
  }, []);

  const fetchTemplateVariables = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-template-variables', {
        method: 'GET'
      });

      if (error) throw error;
      setTemplateVariables(data || []);
    } catch (error: any) {
      console.error('Failed to fetch template variables:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const copyVariableName = (variableName: string) => {
    navigator.clipboard.writeText(`{{${variableName}}}`);
    setCopiedVariable(variableName);
    setTimeout(() => setCopiedVariable(null), 2000);
    toast({
      title: "Copied",
      description: `Variable {{${variableName}}} copied to clipboard`,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'content': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'custom': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredVariables = templateVariables.filter(variable => {
    return selectedCategory === 'all' || variable.category === selectedCategory;
  });

  const groupedVariables = filteredVariables.reduce((groups, variable) => {
    const category = variable.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(variable);
    return groups;
  }, {} as Record<string, TemplateVariable[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {template ? 'Edit Template' : 'New Template'}
            </h1>
            <p className="text-muted-foreground">
              {template ? `Editing ${template.template_name}` : 'Create a new email template'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="h-4 w-4" />
          Save Template
        </Button>
      </div>

      <div className="space-y-4">
        {/* Collapsible Template Details */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Template Details</CardTitle>
                    <CardDescription className="text-sm">
                      {detailsOpen ? 'Click to collapse' : 'Click to expand and configure template information'}
                    </CardDescription>
                  </div>
                  {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input
                      id="template_name"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="e.g., signup, daily_quotes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Welcome to Sunday4k"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* HTML Content */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>HTML Content</CardTitle>
              <CardDescription>
                Edit the HTML content of your email template
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="Enter your HTML content here..."
                className="min-h-[500px] font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Preview and Variables */}
          <div className="space-y-4">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  Email Preview
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                      className="gap-1 h-8"
                    >
                      <Monitor className="h-3 w-3" />
                      <span className="text-xs">Desktop</span>
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                      className="gap-1 h-8"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span className="text-xs">Mobile</span>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={previewTheme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewTheme('light')}
                      className="gap-1 h-8"
                    >
                      <Sun className="h-3 w-3" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={previewTheme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewTheme('dark')}
                      className="gap-1 h-8"
                    >
                      <Moon className="h-3 w-3" />
                      <span className="text-xs">Dark</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                } ${previewTheme === 'dark' ? 'border-gray-600' : 'border-border'}`}>
                  <div className={`px-3 py-2 text-xs font-medium border-b ${
                    previewTheme === 'dark' 
                      ? 'bg-gray-800 text-gray-200 border-gray-600' 
                      : 'bg-muted border-b'
                  }`}>
                    {formData.subject || 'Email Subject'}
                  </div>
                  <div 
                    className={`p-4 overflow-auto ${
                      previewTheme === 'dark' 
                        ? 'bg-[#1a1a1a]' 
                        : 'bg-white'
                    }`}
                    style={{ 
                      fontSize: previewMode === 'mobile' ? '14px' : '16px',
                      colorScheme: previewTheme === 'dark' ? 'dark' : 'light',
                      maxHeight: '400px',
                      ...(previewTheme === 'dark' && {
                        filter: 'invert(0.9) hue-rotate(180deg)',
                      })
                    }}
                  >
                    <div
                      style={previewTheme === 'dark' ? {
                        filter: 'invert(1) hue-rotate(180deg)',
                      } : undefined}
                      dangerouslySetInnerHTML={{ __html: formData.html_content }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Variables */}
            <Collapsible open={variablesOpen} onOpenChange={setVariablesOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Template Variables</CardTitle>
                        <CardDescription className="text-sm">
                          {variablesOpen ? 'Click to collapse' : `${templateVariables.length} variables available - click to view`}
                        </CardDescription>
                      </div>
                      {variablesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-4">
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                      <TabsList className="grid w-full grid-cols-5 h-8">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                        <TabsTrigger value="user" className="text-xs">User</TabsTrigger>
                        <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                        <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {selectedCategory === 'all' ? (
                        Object.entries(groupedVariables).map(([category, categoryVariables]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-xs font-semibold capitalize text-muted-foreground">{category}</h4>
                            <div className="space-y-2">
                              {categoryVariables.map((variable) => (
                                <div key={variable.id} className="flex items-start justify-between p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                        {`{{${variable.variable_name}}}`}
                                      </code>
                                      <Badge className={`${getCategoryColor(variable.category)} text-xs px-1 py-0`}>
                                        {variable.data_type}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {variable.description}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyVariableName(variable.variable_name)}
                                    className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                                  >
                                    {copiedVariable === variable.variable_name ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-2">
                          {filteredVariables.map((variable) => (
                            <div key={variable.id} className="flex items-start justify-between p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                    {`{{${variable.variable_name}}}`}
                                  </code>
                                  <Badge className={`${getCategoryColor(variable.category)} text-xs px-1 py-0`}>
                                    {variable.data_type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {variable.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyVariableName(variable.variable_name)}
                                className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                              >
                                {copiedVariable === variable.variable_name ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;