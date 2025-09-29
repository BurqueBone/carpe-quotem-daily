import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  created_at: string;
  updated_at: string;
}

const AdminTemplateVariables: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingVariable, setEditingVariable] = useState<TemplateVariable | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    variable_name: string;
    display_name: string;
    description: string;
    category: 'system' | 'user' | 'content' | 'custom';
    data_type: 'text' | 'url' | 'date' | 'boolean' | 'number';
    default_value: string;
    is_active: boolean;
  }>({
    variable_name: '',
    display_name: '',
    description: '',
    category: 'custom',
    data_type: 'text',
    default_value: '',
    is_active: true
  });

  // Redirect if not admin
  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-template-variables', {
        method: 'GET'
      });

      if (error) throw error;
      setVariables(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch template variables: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariable = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-template-variables', {
        method: 'POST',
        body: formData
      });

      if (error) throw error;

      setVariables([...variables, data]);
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Template variable created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create template variable: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateVariable = async () => {
    if (!editingVariable) return;

    try {
      const { data, error } = await supabase.functions.invoke(`admin-template-variables?id=${editingVariable.id}`, {
        method: 'PUT',
        body: formData
      });

      if (error) throw error;

      setVariables(variables.map(v => v.id === editingVariable.id ? data : v));
      setEditingVariable(null);
      resetForm();
      toast({
        title: "Success",
        description: "Template variable updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update template variable: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteVariable = async (variable: TemplateVariable) => {
    try {
      const { error } = await supabase.functions.invoke(`admin-template-variables?id=${variable.id}`, {
        method: 'DELETE'
      });

      if (error) throw error;

      setVariables(variables.filter(v => v.id !== variable.id));
      toast({
        title: "Success",
        description: "Template variable deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete template variable: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      variable_name: '',
      display_name: '',
      description: '',
      category: 'custom',
      data_type: 'text',
      default_value: '',
      is_active: true
    });
  };

  const openEditDialog = (variable: TemplateVariable) => {
    setEditingVariable(variable);
    setFormData({
      variable_name: variable.variable_name,
      display_name: variable.display_name,
      description: variable.description || '',
      category: variable.category,
      data_type: variable.data_type,
      default_value: variable.default_value || '',
      is_active: variable.is_active
    });
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

  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.variable_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedVariables = filteredVariables.reduce((groups, variable) => {
    const category = variable.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(variable);
    return groups;
  }, {} as Record<string, TemplateVariable[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading template variables...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Template Variables</h1>
            <p className="text-muted-foreground">
              Manage email template variables that can be used in all email templates
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Variable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Template Variable</DialogTitle>
                <DialogDescription>
                  Add a new variable that can be used in email templates.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="variable_name" className="text-right">
                    Variable Name
                  </Label>
                  <Input
                    id="variable_name"
                    value={formData.variable_name}
                    onChange={(e) => setFormData({...formData, variable_name: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., user.name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="display_name" className="text-right">
                    Display Name
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., User Name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="col-span-3"
                    placeholder="Describe what this variable represents..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="data_type" className="text-right">
                    Data Type
                  </Label>
                  <Select value={formData.data_type} onValueChange={(value: any) => setFormData({...formData, data_type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="default_value" className="text-right">
                    Default Value
                  </Label>
                  <Input
                    id="default_value"
                    value={formData.default_value}
                    onChange={(e) => setFormData({...formData, default_value: e.target.value})}
                    className="col-span-3"
                    placeholder="Optional default value"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_active" className="text-right">
                    Active
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateVariable}>
                  Create Variable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Variables List */}
        <Tabs value={selectedCategory === 'all' ? 'all' : selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All ({variables.length})</TabsTrigger>
            <TabsTrigger value="system">System ({variables.filter(v => v.category === 'system').length})</TabsTrigger>
            <TabsTrigger value="user">User ({variables.filter(v => v.category === 'user').length})</TabsTrigger>
            <TabsTrigger value="content">Content ({variables.filter(v => v.category === 'content').length})</TabsTrigger>
            <TabsTrigger value="custom">Custom ({variables.filter(v => v.category === 'custom').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {Object.entries(groupedVariables).map(([category, categoryVariables]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize">{category} Variables</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryVariables.map((variable) => (
                    <Card key={variable.id} className={!variable.is_active ? 'opacity-60' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium">
                              {variable.display_name}
                            </CardTitle>
                            <CardDescription className="font-mono text-xs mt-1">
                              {`{{${variable.variable_name}}}`}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(variable.category)}>
                              {variable.category}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyVariableName(variable.variable_name)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedVariable === variable.variable_name ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {variable.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {variable.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">{variable.data_type}</Badge>
                            {variable.is_system && <Badge variant="secondary">System</Badge>}
                            {!variable.is_active && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(variable)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!variable.is_system && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the template variable "{variable.display_name}".
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteVariable(variable)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {['system', 'user', 'content', 'custom'].map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVariables.filter(v => v.category === category).map((variable) => (
                  <Card key={variable.id} className={!variable.is_active ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">
                            {variable.display_name}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs mt-1">
                            {`{{${variable.variable_name}}}`}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyVariableName(variable.variable_name)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedVariable === variable.variable_name ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {variable.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {variable.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline">{variable.data_type}</Badge>
                          {variable.is_system && <Badge variant="secondary">System</Badge>}
                          {!variable.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(variable)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {!variable.is_system && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the template variable "{variable.display_name}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteVariable(variable)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingVariable} onOpenChange={(open) => !open && setEditingVariable(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Template Variable</DialogTitle>
              <DialogDescription>
                Update the template variable details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_variable_name" className="text-right">
                  Variable Name
                </Label>
                <Input
                  id="edit_variable_name"
                  value={formData.variable_name}
                  onChange={(e) => setFormData({...formData, variable_name: e.target.value})}
                  className="col-span-3"
                  disabled={editingVariable?.is_system}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_display_name" className="text-right">
                  Display Name
                </Label>
                <Input
                  id="edit_display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="col-span-3"
                  disabled={editingVariable?.is_system}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              {!editingVariable?.is_system && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_category" className="text-right">
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_data_type" className="text-right">
                      Data Type
                    </Label>
                    <Select value={formData.data_type} onValueChange={(value: any) => setFormData({...formData, data_type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_default_value" className="text-right">
                      Default Value
                    </Label>
                    <Input
                      id="edit_default_value"
                      value={formData.default_value}
                      onChange={(e) => setFormData({...formData, default_value: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_is_active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateVariable}>
                Update Variable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTemplateVariables;