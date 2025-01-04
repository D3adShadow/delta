import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();
    console.log("Creating order for amount:", amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error("Invalid amount provided:", amount);
      return new Response(
        JSON.stringify({ error: "Invalid amount provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    console.log("Initializing Razorpay order creation...");
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
    });

    console.log("Order created successfully:", order);

    return new Response(
      JSON.stringify(order),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create order",
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