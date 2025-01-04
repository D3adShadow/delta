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

    console.log('Checking Razorpay credentials...');
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials missing');
      return new Response(
        JSON.stringify({ error: 'Razorpay configuration is missing' }),
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log('Creating Razorpay instance...');
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Amount should be in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(amount * 100);
    console.log('Amount in paise:', amountInPaise);

    const orderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId
      }
    };
    console.log('Creating order with data:', orderData);

    const order = await razorpay.orders.create(orderData);
    console.log('Order created successfully:', order);

    return new Response(
      JSON.stringify(order),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // Check if it's a Razorpay API error
    if (error.statusCode) {
      return new Response(
        JSON.stringify({ 
          error: error.error.description || error.message,
          code: error.statusCode
        }),
        { 
          status: error.statusCode,
          headers: corsHeaders,
        }
      );
    }
    // Generic error
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