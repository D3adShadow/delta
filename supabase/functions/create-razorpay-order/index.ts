import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "npm:razorpay@2.9.2";

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
    console.log("Received request with amount:", amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error("Invalid amount:", amount);
      return new Response(
        JSON.stringify({ error: "Invalid amount provided" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      console.error("Missing Razorpay credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Initializing Razorpay with credentials");
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const receipt = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log("Creating Razorpay order for amount:", amount, "with receipt:", receipt);
    
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      notes: {
        description: `Points purchase for amount ${amount}`
      },
      payment_capture: 1
    };
    
    console.log("Order data:", orderData);
    const order = await razorpay.orders.create(orderData);
    console.log("Order created successfully:", order);

    return new Response(
      JSON.stringify(order),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to create order",
        details: error.message || "Unknown error occurred",
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});