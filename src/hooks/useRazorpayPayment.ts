import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseRazorpayPaymentProps {
  onSuccess?: () => void;
}

export const useRazorpayPayment = ({ onSuccess }: UseRazorpayPaymentProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchasePoints = async (pointsAmount: number, priceInRupees: number) => {
    try {
      setIsLoading(true);
      console.log("[Payment] Starting payment process", { pointsAmount, priceInRupees });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("[Payment] No authenticated user found");
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase points",
          variant: "destructive",
        });
        return;
      }

      console.log("[Payment] Creating Razorpay order", { userId: user.id, amount: priceInRupees });
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: priceInRupees,
          userId: user.id,
          pointsAmount: pointsAmount // Adding points amount to track in edge function
        },
      });

      if (orderResponse.error) {
        console.error("[Payment] Order creation failed:", orderResponse.error);
        toast({
          title: "Payment initialization failed",
          description: orderResponse.error.message || "Could not create payment order. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("[Payment] Razorpay order created successfully:", orderResponse.data);
      const order = orderResponse.data;

      const options = {
        key: "rzp_test_51Ix3QI9qwYH2Ez", // This should match the key in Supabase
        amount: order.amount,
        currency: "INR",
        name: "Delta Learning",
        description: `Purchase ${pointsAmount} points`,
        order_id: order.id,
        handler: async function (response: any) {
          console.log("[Payment] Payment successful, verifying...", response);
          try {
            const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                pointsAmount: pointsAmount,
              },
            });

            if (verifyResponse.error) {
              console.error("[Payment] Verification failed:", verifyResponse.error);
              toast({
                title: "Payment verification failed",
                description: verifyResponse.error.message || "There was an error verifying your payment. Please contact support.",
                variant: "destructive",
              });
              return;
            }

            console.log("[Payment] Payment verified successfully:", verifyResponse.data);
            toast({
              title: "Points purchased successfully!",
              description: `${pointsAmount} points have been added to your account`,
            });
            
            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            console.error("[Payment] Error in payment verification:", error);
            toast({
              title: "Payment verification failed",
              description: "There was an error processing your payment. Please try again.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function() {
            console.log("[Payment] Payment modal dismissed by user");
            setIsLoading(false);
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process. No points were added.",
              variant: "destructive",
            });
          }
        }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("[Payment] Error initiating payment:", error);
      toast({
        title: "Payment failed",
        description: "There was an error initiating the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePurchasePoints, isLoading };
};