import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, pointsAmount } = await req.json();
    console.log("Verifying payment:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    // Verify payment signature
    const isValid = razorpay.validateWebhookSignature(
      JSON.stringify({ order_id: razorpay_order_id, payment_id: razorpay_payment_id }),
      razorpay_signature,
      Deno.env.get('RAZORPAY_KEY_SECRET') || ''
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user points in the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const currentPoints = userData?.points || 0;
    const newPoints = currentPoints + pointsAmount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log("Payment verified and points updated successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});