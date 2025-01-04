import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseRazorpayPaymentProps {
  onSuccess?: () => void;
}

export const useRazorpayPayment = ({ onSuccess }: UseRazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchasePoints = async (pointsAmount: number, priceInRupees: number) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create order
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: priceInRupees, userId: user.id }
      });

      if (orderResponse.error) {
        throw new Error(orderResponse.error.message);
      }

      const order = orderResponse.data;
      console.log('Created order:', order);

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      // Initialize payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Points Purchase',
        description: `Purchase ${pointsAmount} points`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verificationResponse = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                userId: user.id,
                pointsAmount
              }
            });

            if (verificationResponse.error) {
              throw new Error(verificationResponse.error.message);
            }

            toast({
              title: 'Payment Successful',
              description: `Successfully purchased ${pointsAmount} points!`,
            });

            onSuccess?.();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: 'Payment Verification Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#7C3AED',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePurchasePoints, isLoading };
};