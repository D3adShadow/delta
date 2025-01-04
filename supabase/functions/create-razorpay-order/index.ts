import Razorpay from "https://esm.sh/razorpay@2.9.2";
import { serve } from "https://deno.fresh.run/std@v1/http/server.ts";

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
    const { amount, userId } = await req.json();
    console.log(`Creating order for user ${userId} with amount ${amount}`);

    if (!amount || !userId) {
      throw new Error('Amount and userId are required');
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    // Amount should be in smallest currency unit (paise for INR)
    const amountInPaise = amount * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    console.log('Razorpay order created:', order);

    return new Response(
      JSON.stringify(order),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});