import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRazorpayPaymentProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRazorpayPayment = ({ onSuccess, onError }: UseRazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchasePoints = async (pointsAmount: number, price: number) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create order
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: price }
      });

      if (orderResponse.error) throw new Error(orderResponse.error.message);
      const order = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Course Platform",
        description: `Purchase ${pointsAmount} points`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                pointsAmount
              }
            });

            if (verifyResponse.error) throw new Error(verifyResponse.error.message);
            
            onSuccess?.();
          } catch (error) {
            console.error('Payment verification failed:', error);
            onError?.(error as Error);
          }
        },
        prefill: {
          email: user.email
        },
        theme: {
          color: "#6366f1"
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePurchasePoints, isLoading };
};