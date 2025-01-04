import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, orderId, signature, userId, pointsAmount } = await req.json();
    console.log('Verifying payment:', { paymentId, orderId, userId, pointsAmount });

    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!key_secret) {
      throw new Error('Razorpay credentials not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the payment signature
    const text = orderId + "|" + paymentId;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = encoder.encode(key_secret);
    
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature_array = await crypto.subtle.sign(
      "HMAC",
      hmacKey,
      data
    );
    
    const generated_signature = Array.from(new Uint8Array(signature_array))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (generated_signature === signature) {
      // Update user points in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({ 
          points: supabase.rpc('increment_points', { points_to_add: pointsAmount })
        })
        .eq('id', userId)
        .select();

      if (userError) {
        throw userError;
      }

      return new Response(JSON.stringify({ success: true, data: userData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});