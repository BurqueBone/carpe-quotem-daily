import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  Smartphone, 
  Monitor,
  Sun,
  Moon
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  description?: string;
  is_active: boolean;
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: (templateData: any) => void;
  onCancel: () => void;
}

const EmailTemplateEditor = ({ template, onSave, onCancel }: EmailTemplateEditorProps) => {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    description: template?.description || '',
    is_active: template?.is_active ?? true,
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const templateVariables = [
    { name: '{{user_email}}', description: 'User\'s email address' },
    { name: '{{confirmation_url}}', description: 'Email confirmation link' },
    { name: '{{reset_password_url}}', description: 'Password reset link' },
    { name: '{{quote}}', description: 'Daily quote text' },
    { name: '{{author}}', description: 'Quote author name' },
    { name: '{{resource.title}}', description: 'Resource title' },
    { name: '{{resource.description}}', description: 'Resource description' },
    { name: '{{resource.url}}', description: 'Resource URL' },
    { name: '{{resource.category}}', description: 'Resource category' },
    { name: '{{resource.type}}', description: 'Resource type' },
    { name: '{{base_url}}', description: 'Application base URL' },
    { name: '{{unsubscribe_token}}', description: 'Unsubscribe token' },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Configure the basic template information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HTML Content</CardTitle>
              <CardDescription>
                Edit the HTML content of your email template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="Enter your HTML content here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </CardTitle>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                    className="gap-2"
                  >
                    <Monitor className="h-3 w-3" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                    className="gap-2"
                  >
                    <Smartphone className="h-3 w-3" />
                    Mobile
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={previewTheme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewTheme('light')}
                    className="gap-2"
                  >
                    <Sun className="h-3 w-3" />
                    Light Mode
                  </Button>
                  <Button
                    variant={previewTheme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewTheme('dark')}
                    className="gap-2"
                  >
                    <Moon className="h-3 w-3" />
                    Dark Mode
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm' : 'w-full'
              } ${previewTheme === 'dark' ? 'border-gray-600' : 'border-border'}`}>
                <div className={`px-3 py-2 text-xs font-medium border-b ${
                  previewTheme === 'dark' 
                    ? 'bg-gray-800 text-gray-200 border-gray-600' 
                    : 'bg-muted border-b'
                }`}>
                  {formData.subject || 'Email Subject'}
                </div>
                <div 
                  className={`p-4 overflow-auto max-h-96 ${
                    previewTheme === 'dark' 
                      ? 'bg-[#1a1a1a]' 
                      : 'bg-white'
                  }`}
                  style={{ 
                    fontSize: previewMode === 'mobile' ? '14px' : '16px',
                    colorScheme: previewTheme === 'dark' ? 'dark' : 'light',
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

          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Available variables you can use in your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {templateVariables.map((variable) => (
                  <div key={variable.name} className="space-y-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {variable.name}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {variable.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;