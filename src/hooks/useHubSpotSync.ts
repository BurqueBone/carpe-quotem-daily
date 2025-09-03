import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface HubSpotSyncOptions {
  action: 'create_or_update' | 'add_to_list';
  additionalData?: {
    listId?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    website?: string;
    [key: string]: any;
  };
}

export const useHubSpotSync = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const syncToHubSpot = async (options: HubSpotSyncOptions) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be authenticated to sync to HubSpot',
        variant: 'destructive',
      });
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-hubspot', {
        body: options
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: 'User data synced to HubSpot successfully',
        });
        return { success: true, data: data.hubspotResult };
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('HubSpot sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync user data to HubSpot',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateContact = async (additionalData?: HubSpotSyncOptions['additionalData']) => {
    return syncToHubSpot({
      action: 'create_or_update',
      additionalData
    });
  };

  const addToList = async (listId: string, additionalData?: HubSpotSyncOptions['additionalData']) => {
    return syncToHubSpot({
      action: 'add_to_list',
      additionalData: { ...additionalData, listId }
    });
  };

  return {
    syncToHubSpot,
    createOrUpdateContact,
    addToList,
    loading
  };
};