import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Quote {
  id: string;
  quote: string;
  author: string;
  source?: string;
  display_count: number;
  last_displayed_at: string;
}

export const useQuoteOfTheDay = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_random_quote_and_track')
        .single();
      
      if (error) throw error;

      if (data) {
        setQuote({
          id: data.id,
          quote: data.quote,
          author: data.author,
          source: data.source,
          display_count: data.display_count,
          last_displayed_at: data.last_displayed_at
        });
      } else {
        throw new Error('No quote found');
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return { quote, loading, error, refetch: fetchQuote };
};