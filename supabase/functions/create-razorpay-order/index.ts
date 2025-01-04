import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Raw request data:', requestData);

    const { amount, userId } = requestData;
    
    if (!amount || !userId) {
      console.error('Missing required parameters:', { amount, userId });
      return new Response(
        JSON.stringify({ 
          error: 'Amount and userId are required',
          received: { amount, userId } 
        }),
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found');
      return new Response(
        JSON.stringify({ error: 'Razorpay configuration is missing' }),
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log('Creating Razorpay instance with credentials');
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Amount should be in smallest currency unit (paise for INR)
    const amountInPaise = amount * 100;
    console.log('Calculated amount in paise:', amountInPaise);

    console.log('Creating Razorpay order with params:', {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      userId
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId
      }
    });

    console.log('Razorpay order created successfully:', order);

    return new Response(
      JSON.stringify(order),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});