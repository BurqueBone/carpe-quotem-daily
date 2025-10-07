/**
 * Server-side template variable processing for Supabase Edge Functions
 */

interface TemplateVariable {
  variable_name: string;
  display_name: string;
  description: string | null;
  category: 'system' | 'user' | 'content' | 'custom';
  data_type: 'text' | 'url' | 'date' | 'boolean' | 'number';
  default_value: string | null;
  is_system: boolean;
  is_active: boolean;
}

interface TemplateContext {
  quote?: {
    quote: string;
    author: string;
    source?: string;
  };
  resource?: {
    title: string;
    description: string;
    url: string;
    type?: string;
    how_resource_helps?: string;
    category?: {
      title: string;
      icon_name?: string;
    };
  };
  user?: {
    email: string;
    name?: string;
  };
  system?: {
    current_date: string;
    unsubscribe_url: string;
    app_url: string;
  };
  [key: string]: any;
}

/**
 * Processes template variables in HTML content (server-side version)
 * @param template - HTML template string with variables like {{variable.name}}
 * @param context - Object containing variable values
 * @param variables - Available template variables from database
 * @returns Processed HTML string with variables replaced
 */
export function processTemplateVariables(
  template: string,
  context: TemplateContext,
  variables: TemplateVariable[]
): string {
  let processedTemplate = template;

  // Create a map of variable names to their data types for type-aware processing
  const variableMap = new Map(
    variables.map(v => [v.variable_name, v])
  );

  // Find all variables in the template
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = Array.from(template.matchAll(variableRegex));

  for (const match of matches) {
    const variableName = match[1].trim();
    const fullMatch = match[0];
    
    try {
      // Get the variable configuration
      const variableConfig = variableMap.get(variableName);
      
      // Resolve the value from context
      let value = resolveVariableValue(variableName, context);
      
      // Apply type-specific formatting
      if (variableConfig && value !== null && value !== undefined) {
        value = formatVariableValue(value, variableConfig.data_type);
      }
      
      // Use default value if no value found and default exists
      if ((value === null || value === undefined || value === '') && variableConfig?.default_value) {
        value = variableConfig.default_value;
      }
      
      // Replace the variable in the template
      if (value !== null && value !== undefined) {
        processedTemplate = processedTemplate.replace(fullMatch, escapeHtml(String(value)));
      } else {
        // Remove the variable placeholder if no value found
        processedTemplate = processedTemplate.replace(fullMatch, '');
      }
    } catch (error) {
      console.warn(`Error processing variable ${variableName}:`, error);
      // Remove problematic variables
      processedTemplate = processedTemplate.replace(fullMatch, '');
    }
  }

  // Process conditional blocks (e.g., {{#if resource}}...{{/if}})
  processedTemplate = processConditionalBlocks(processedTemplate, context);

  return processedTemplate;
}

/**
 * Resolves a variable value from the context using dot notation
 * @param variableName - Variable name (e.g., "quote.author", "user.email")
 * @param context - Context object containing values
 * @returns The resolved value or null if not found
 */
function resolveVariableValue(variableName: string, context: TemplateContext): any {
  const parts = variableName.split('.');
  let current: any = context;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Formats a value based on its data type
 * @param value - The value to format
 * @param dataType - The data type for formatting
 * @returns Formatted value
 */
function formatVariableValue(value: any, dataType: string): string {
  switch (dataType) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      } else if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleDateString();
      }
      return String(value);
      
    case 'url':
      // Ensure URLs are properly formatted
      if (typeof value === 'string' && value) {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return `https://${value}`;
        }
      }
      return String(value);
      
    case 'boolean':
      return value ? 'Yes' : 'No';
      
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
      
    case 'text':
    default:
      if (value && typeof value === 'object') {
        // Gracefully handle objects used in text fields (e.g., category objects)
        // Prefer common display fields if present
        // @ts-ignore - runtime safeguard
        if ('title' in value && typeof (value as any).title !== 'object') return String((value as any).title);
        // @ts-ignore
        if ('name' in value && typeof (value as any).name !== 'object') return String((value as any).name);
        try { return JSON.stringify(value); } catch { return String(value); }
      }
      return String(value);
  }
}

/**
 * Processes conditional blocks in the template
 * @param template - Template string with conditional blocks
 * @param context - Context object for condition evaluation
 * @returns Template with conditional blocks processed
 */
function processConditionalBlocks(template: string, context: TemplateContext): string {
  // Process {{#if variable}}...{{/if}} blocks
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  return template.replace(ifRegex, (match, conditionVar, content) => {
    const value = resolveVariableValue(conditionVar.trim(), context);
    
    // Evaluate truthiness
    const shouldShow = value !== null && 
                      value !== undefined && 
                      value !== '' && 
                      value !== false &&
                      (Array.isArray(value) ? value.length > 0 : true);
    
    return shouldShow ? content : '';
  });
}

/**
 * Escapes HTML in variable values to prevent XSS (server-side version)
 * @param text - Text to escape
 * @returns HTML-escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds default template context for email processing
 * @param quote - Quote object
 * @param resource - Resource object  
 * @param userEmail - User email address
 * @returns Template context object
 */
export function buildTemplateContext(
  quote?: any,
  resource?: any,
  userEmail?: string
): TemplateContext {
  const now = new Date();
  
  const categoryTitle = (() => {
    if (!resource?.category) return '';
    if (typeof resource.category === 'string') return resource.category;
    return resource.category?.title || '';
  })();
  
  return {
    quote: quote ? {
      quote: quote.quote || '',
      author: quote.author || '',
      source: quote.source || ''
    } : undefined,
    
    resource: resource ? {
      title: resource.title || '',
      description: resource.description || '',
      url: (resource.has_affiliate && resource.affiliate_url) ? resource.affiliate_url : (resource.url || ''),
      type: resource.type || '',
      how_resource_helps: resource.how_resource_helps || '',
      category: (() => {
        if (!resource.category) return undefined;
        if (typeof resource.category === 'string') return { title: resource.category, icon_name: null };
        return { 
          title: resource.category?.title || '',
          icon_name: resource.category?.icon_name || null
        };
      })()
    } : undefined,
    
    user: userEmail ? {
      email: userEmail
    } : undefined,
    
    contact: {
      firstname: userEmail?.split('@')[0] || 'Friend'
    },
    
    custom: {
      daily_quote: quote?.quote || '',
      quote_author: quote?.author || '',
      resource_category: categoryTitle,
      resource_type: resource?.type || '',
      resource_title: resource?.title || '',
      resource_description: resource?.description || '',
      resource_url: (resource?.has_affiliate && resource?.affiliate_url) ? resource.affiliate_url : (resource?.url || ''),
      app_url: 'https://sunday4k.life',
      website_url: 'https://sunday4k.life',
      support_email: 'info@sunday4k.life'
    },
    
    system: {
      current_date: now.toLocaleDateString(),
      unsubscribe_url: `https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/unsubscribe`,
      app_url: `https://sunday4k.life`
    }
  };
}