import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const createRazorpayOrder = async (keyId: string, keySecret: string, orderData: any) => {
  const auth = btoa(`${keyId}:${keySecret}`);
  console.log('Creating Razorpay order with data:', orderData);
  
  try {
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
      console.error('Razorpay API error:', error);
      throw new Error(error.error.description || 'Failed to create Razorpay order');
    }

    const data = await response.json();
    console.log('Razorpay order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

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
      console.error('Razorpay credentials missing');
      return new Response(
        JSON.stringify({ 
          error: 'Razorpay configuration is missing',
          details: 'Please check Edge Function secrets configuration'
        }),
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }

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

    const order = await createRazorpayOrder(razorpayKeyId, razorpayKeySecret, orderData);

    return new Response(
      JSON.stringify(order),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An unexpected error occurred while processing the payment'
      }),
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});