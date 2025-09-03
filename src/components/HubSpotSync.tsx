import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users } from 'lucide-react';
import { useHubSpotSync } from '@/hooks/useHubSpotSync';

export const HubSpotSync: React.FC = () => {
  const { createOrUpdateContact, addToList, loading } = useHubSpotSync();
  const [listId, setListId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const handleSyncContact = async () => {
    await createOrUpdateContact({
      firstName,
      lastName,
      company,
      phone
    });
  };

  const handleAddToList = async () => {
    if (!listId.trim()) {
      alert('Please enter a HubSpot list ID');
      return;
    }
    
    await addToList(listId, {
      firstName,
      lastName,
      company,
      phone
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          HubSpot Marketing Sync
        </CardTitle>
        <CardDescription>
          Sync your profile information to HubSpot for marketing purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <Button 
          onClick={handleSyncContact} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            'Sync to HubSpot'
          )}
        </Button>

        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="listId">HubSpot List ID (Optional)</Label>
          <Input
            id="listId"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            placeholder="12345"
          />
          <Button 
            onClick={handleAddToList} 
            disabled={loading || !listId.trim()}
            variant="outline"
            className="w-full"
          >
            Add to HubSpot List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};