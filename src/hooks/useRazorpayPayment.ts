import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseRazorpayPaymentProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRazorpayPayment = ({ onSuccess, onError }: UseRazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchasePoints = async (pointsAmount: number, price: number) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase points",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating Razorpay order with price:", price);
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: price }
      });

      if (orderResponse.error) {
        console.error("Order creation failed:", orderResponse.error);
        throw new Error(orderResponse.error.message || "Failed to create order");
      }

      if (!orderResponse.data) {
        console.error("No order data received");
        throw new Error("No order data received from server");
      }

      const order = orderResponse.data;
      console.log("Order created:", order);

      if (!order.id || !order.amount) {
        console.error("Invalid order data:", order);
        throw new Error("Invalid order data received");
      }

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
            console.log("Payment successful, verifying...", response);
            const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                pointsAmount
              }
            });

            if (verifyResponse.error) {
              console.error("Payment verification failed:", verifyResponse.error);
              throw new Error(verifyResponse.error.message || "Payment verification failed");
            }
            
            console.log("Payment verified successfully");
            toast({
              title: "Success",
              description: `Successfully purchased ${pointsAmount} points!`,
            });
            onSuccess?.();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Error",
              description: "Failed to verify payment. Please contact support.",
              variant: "destructive",
            });
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
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePurchasePoints, isLoading };
};