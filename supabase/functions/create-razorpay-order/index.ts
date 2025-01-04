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
    const { amount, userId } = await req.json();
    console.log(`Creating Razorpay order for amount: ${amount}, userId: ${userId}`);

    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials not configured');
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${key_id}:${key_secret}`)}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `points_purchase_${Date.now()}`,
      }),
    });

    const order = await response.json();
    console.log('Razorpay order created:', order);

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});