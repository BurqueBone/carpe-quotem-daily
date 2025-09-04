import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Download, Send, Eye, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const EmailTemplateManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    emailId: '', // HubSpot template ID
    customQuote: '',
    customAuthor: ''
  });

  const handleDownloadTemplate = () => {
    const templateContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sunday4k Email Template</title>
    <!-- Template content would go here -->
</head>
<body>
    <!-- This would contain the full HTML template -->
    <p>Download the full template from the project files at src/templates/sunday4k-email-template.html</p>
</body>
</html>`;

    const blob = new Blob([templateContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunday4k-email-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "The HTML template has been downloaded. Upload it to HubSpot to create your email template.",
    });
  };

  const handleSendTestEmail = async () => {
    if (!emailData.recipientEmail || !emailData.emailId) {
      toast({
        title: "Missing Information",
        description: "Please provide recipient email and HubSpot template ID.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-hubspot-email', {
        body: {
          emailId: emailData.emailId,
          recipientEmail: emailData.recipientEmail,
          recipientName: emailData.recipientName,
          customQuote: emailData.customQuote,
          customAuthor: emailData.customAuthor,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent Successfully",
        description: `Test email sent to ${emailData.recipientEmail} with today's inspiring quote.`,
      });

      // Clear form
      setEmailData(prev => ({
        ...prev,
        recipientEmail: '',
        recipientName: '',
        customQuote: '',
        customAuthor: ''
      }));

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Send Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyTemplateInstructions = () => {
    const instructions = `How to Upload Sunday4k Email Template to HubSpot:

1. Download the HTML template using the button above
2. Log into your HubSpot account
3. Go to Marketing > Email > Templates
4. Click "Create template" > "Custom coded template"
5. Upload the downloaded HTML file
6. Configure your template settings:
   - Name: "Sunday4k Daily Inspiration"
   - Template type: Marketing email
7. Add custom properties for dynamic content:
   - daily_quote (Text)
   - quote_author (Text)
   - app_url (URL)
   - website_url (URL)
   - support_email (Email)
   - preference_center (URL)
8. Save your template and note the Template ID
9. Use the Template ID in the form below to send test emails

Brand Colors Used:
- Primary: #9381ff
- Secondary: #FFD8BE
- Accent: #B8B8FF, #F8F7FF, #FFEEDD`;

    navigator.clipboard.writeText(instructions);
    toast({
      title: "Instructions Copied",
      description: "Setup instructions copied to clipboard.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Sunday4k Email Template Manager
          </CardTitle>
          <CardDescription>
            Create and manage your branded email templates for HubSpot marketing campaigns
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="send">Send Test</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>
                Download your custom Sunday4k branded email template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Template Features:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Responsive design optimized for all devices</li>
                  <li>• Sunday4k brand colors and styling</li>
                  <li>• Dynamic quote insertion with HubSpot variables</li>
                  <li>• Professional call-to-action buttons</li>
                  <li>• Inspirational daily content sections</li>
                  <li>• Unsubscribe and preference management</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleDownloadTemplate} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download HTML Template
                </Button>
                <Button variant="outline" onClick={copyTemplateInstructions} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Setup Instructions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test email using your HubSpot template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emailId">HubSpot Template ID *</Label>
                  <Input
                    id="emailId"
                    value={emailData.emailId}
                    onChange={(e) => setEmailData(prev => ({ ...prev, emailId: e.target.value }))}
                    placeholder="Enter your HubSpot template ID"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailData.recipientEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="test@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={emailData.recipientName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Quote (optional)</Label>
                <Textarea
                  value={emailData.customQuote}
                  onChange={(e) => setEmailData(prev => ({ ...prev, customQuote: e.target.value }))}
                  placeholder="Enter a custom inspirational quote (leave blank to use today's quote)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customAuthor">Quote Author (optional)</Label>
                <Input
                  id="customAuthor"
                  value={emailData.customAuthor}
                  onChange={(e) => setEmailData(prev => ({ ...prev, customAuthor: e.target.value }))}
                  placeholder="Author name for custom quote"
                />
              </div>

              <Button 
                onClick={handleSendTestEmail} 
                disabled={isLoading}
                className="w-full flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HubSpot Setup Guide</CardTitle>
              <CardDescription>
                Step-by-step instructions to set up your email template in HubSpot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Setup Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Download the HTML template from the Template tab</li>
                  <li>Log into your HubSpot account</li>
                  <li>Navigate to Marketing → Email → Templates</li>
                  <li>Click "Create template" → "Custom coded template"</li>
                  <li>Upload the downloaded HTML file</li>
                  <li>Name your template "Sunday4k Daily Inspiration"</li>
                  <li>Set template type to "Marketing email"</li>
                  <li>Configure custom properties (see below)</li>
                  <li>Save and note the Template ID for testing</li>
                </ol>
              </div>

              <div className="bg-accent p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Required Custom Properties:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><code className="bg-background px-1 rounded">daily_quote</code> (Text)</div>
                  <div><code className="bg-background px-1 rounded">quote_author</code> (Text)</div>
                  <div><code className="bg-background px-1 rounded">app_url</code> (URL)</div>
                  <div><code className="bg-background px-1 rounded">website_url</code> (URL)</div>
                  <div><code className="bg-background px-1 rounded">support_email</code> (Email)</div>
                  <div><code className="bg-background px-1 rounded">preference_center</code> (URL)</div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-primary mb-3">Brand Colors Used:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9381ff' }}></div>
                    <span>Primary: #9381ff</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFD8BE' }}></div>
                    <span>Secondary: #FFD8BE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#B8B8FF' }}></div>
                    <span>Accent: #B8B8FF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F8F7FF' }}></div>
                    <span>Light: #F8F7FF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFEEDD' }}></div>
                    <span>Warm: #FFEEDD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};