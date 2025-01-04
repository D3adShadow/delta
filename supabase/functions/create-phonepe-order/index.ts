import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const createPhonePeOrder = async (merchantId: string, saltKey: string, saltIndex: string, orderData: any) => {
  console.log("[Edge] Creating PhonePe order with data:", orderData);
  
  const payload = {
    merchantId: merchantId,
    merchantTransactionId: `order_${Date.now()}`,
    merchantUserId: orderData.userId,
    amount: orderData.amount * 100, // Convert to paisa
    redirectUrl: `${orderData.redirectUrl}/payment-status`,
    redirectMode: "REDIRECT",
    callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-phonepe-payment`,
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  const base64Payload = btoa(JSON.stringify(payload));
  const checksum = await generateChecksum(base64Payload, saltKey, saltIndex);

  try {
    const response = await fetch("https://api.phonepe.com/apis/hermes/pg/v1/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    const data = await response.json();
    console.log("[Edge] PhonePe response:", data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create PhonePe order');
    }

    return data;
  } catch (error) {
    console.error("[Edge] PhonePe API error:", error);
    throw error;
  }
};

const generateChecksum = async (base64Payload: string, saltKey: string, saltIndex: string) => {
  const message = base64Payload + "/pg/v1/pay" + saltKey;
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${checksum}###${saltIndex}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('[Edge] Received request data:', requestData);

    const { amount, userId, redirectUrl } = requestData;
    
    if (!amount || !userId || !redirectUrl) {
      console.error('[Edge] Missing required parameters:', { amount, userId, redirectUrl });
      return new Response(
        JSON.stringify({ 
          error: 'Amount, userId and redirectUrl are required',
          received: { amount, userId, redirectUrl } 
        }),
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID');
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY');
    const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX');

    if (!merchantId || !saltKey || !saltIndex) {
      console.error('[Edge] PhonePe credentials missing');
      return new Response(
        JSON.stringify({ 
          error: 'PhonePe configuration is missing',
          details: 'Please check Edge Function secrets configuration'
        }),
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const order = await createPhonePeOrder(merchantId, saltKey, saltIndex, {
      amount,
      userId,
      redirectUrl
    });

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