import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      pointsAmount
    } = await req.json();

    console.log("Verifying payment:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId,
      pointsAmount
    });

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    // Verify payment signature
    const isValid = razorpay.validateWebhookSignature(
      razorpay_order_id + "|" + razorpay_payment_id,
      razorpay_signature,
      Deno.env.get('RAZORPAY_KEY_SECRET') || ''
    );

    if (!isValid) {
      console.error("Invalid payment signature");
      throw new Error("Invalid payment signature");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update user points
    const { data: userData, error: fetchError } = await supabaseClient
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      throw new Error("Failed to fetch user data");
    }

    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ points: (userData.points || 0) + pointsAmount })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating user points:", updateError);
      throw new Error("Failed to update user points");
    }

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
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Payment verification failed",
        details: error
      }),
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