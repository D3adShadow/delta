import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const createRazorpayOrder = async (keyId: string, keySecret: string, orderData: any) => {
  console.log("[Edge] Creating Razorpay order with data:", orderData);
  
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const order = await razorpay.orders.create({
      amount: orderData.amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: orderData.userId,
        pointsAmount: orderData.pointsAmount
      }
    });

    console.log("[Edge] Razorpay order created successfully:", order);
    return order;
  } catch (error) {
    console.error("[Edge] Razorpay API error:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('[Edge] Received request data:', requestData);

    const { amount, userId, pointsAmount } = requestData;
    
    if (!amount || !userId) {
      console.error('[Edge] Missing required parameters:', { amount, userId });
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
      console.error('[Edge] Razorpay credentials missing');
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
    console.log('[Edge] Amount in paise:', amountInPaise);

    const orderData = {
      amount: amountInPaise,
      userId,
      pointsAmount
    };

    const order = await createRazorpayOrder(razorpayKeyId, razorpayKeySecret, orderData);

    return new Response(
      JSON.stringify(order),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Edge] Error processing request:', error);
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