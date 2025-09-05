import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Ensure an audience exists in Resend and return its ID
async function getOrCreateAudience(name: string): Promise<string> {
  try {
    // @ts-ignore - SDK typing can vary between versions
    const listed = await resend.audiences.list();
    const arr: any[] = listed?.data?.data || listed?.data || [];
    const existing = arr.find((a: any) => a?.name === name);
    if (existing?.id) return existing.id as string;
  } catch (e) {
    console.log('audiences.list error:', e);
  }
  try {
    // @ts-ignore
    const created = await resend.audiences.create({ name });
    // @ts-ignore
    return created?.data?.id || created?.id as string;
  } catch (e) {
    console.error('audiences.create error:', e);
    throw e;
  }
}

// Create contact if not present, ignore "already exists" errors
async function ensureContactInAudience(email: string, audienceId: string): Promise<void> {
  if (!email || !audienceId) return;
  try {
    // @ts-ignore
    const res = await resend.contacts.create({ audienceId, email });
    // If SDK returns an error object, handle gracefully
    // @ts-ignore
    if (res?.error && String(res.error.message || '').toLowerCase().includes('already')) {
      return;
    }
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('already')) return;
    console.warn('ensureContactInAudience failed:', e);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const action = body?.action as 'sync_all' | 'sync_user';
    const email = body?.email as string | undefined;
    const user_id = body?.user_id as string | undefined;

    const audienceId = await getOrCreateAudience('Sunday4k Subscribers');

    if (action === 'sync_all') {
      // Fetch all enabled recipients and sync their emails
      const { data, error } = await supabase
        .from('notification_settings')
        .select('profiles!inner(email)')
        .eq('enabled', true);

      if (error) throw error;

      let synced = 0;
      for (const row of data || []) {
        const addr = (row as any)?.profiles?.email as string | undefined;
        if (!addr) continue;
        await ensureContactInAudience(addr, audienceId);
        synced++;
      }

      return new Response(JSON.stringify({ success: true, synced }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'sync_user') {
      let addr = email;
      if (!addr && user_id) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user_id)
          .single();
        if (profErr) throw profErr;
        addr = prof?.email as string | undefined;
      }

      if (!addr) {
        return new Response(JSON.stringify({ success: false, error: 'Email required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      await ensureContactInAudience(addr, audienceId);
      return new Response(JSON.stringify({ success: true, email: addr }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('sync-resend-contacts error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});