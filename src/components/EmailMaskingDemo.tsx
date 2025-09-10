import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, FileText } from 'lucide-react';
import { maskEmail, maskEmailForLogs } from '@/lib/utils';

const EmailMaskingDemo = () => {
  const sampleEmail = "john.doe@example.com";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Email Privacy Protection
        </CardTitle>
        <CardDescription>
          Your email addresses are masked for privacy and security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Display Masking</span>
            <Badge variant="outline" className="text-xs">UI</Badge>
          </div>
          <div className="bg-muted p-2 rounded text-sm font-mono">
            Original: {sampleEmail}
          </div>
          <div className="bg-primary/10 p-2 rounded text-sm font-mono">
            Masked: {maskEmail(sampleEmail)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Log Masking</span>
            <Badge variant="outline" className="text-xs">Server</Badge>
          </div>
          <div className="bg-destructive/10 p-2 rounded text-sm font-mono">
            Logs: {maskEmailForLogs(sampleEmail)}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          This protects your privacy while maintaining functionality
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailMaskingDemo;