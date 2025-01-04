import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Create Razorpay instance using their Node.js SDK
const createRazorpayOrder = async (keyId: string, keySecret: string, orderData: any) => {
  const auth = btoa(`${keyId}:${keySecret}`);
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.description || 'Failed to create Razorpay order');
  }

  return response.json();
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

    const order = await createRazorpayOrder(razorpayKeyId, razorpayKeySecret, orderData);
    console.log('Order created successfully:', order);

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