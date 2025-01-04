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
      console.log("Starting payment process for points:", pointsAmount);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase points",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating Razorpay order for user:", user.id);
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: priceInRupees,
          userId: user.id 
        },
      });

      if (orderResponse.error) {
        console.error("Error creating order:", orderResponse.error);
        toast({
          title: "Payment initialization failed",
          description: "Could not create payment order. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Razorpay order created:", orderResponse.data);
      const order = orderResponse.data;

      const options = {
        key: "rzp_test_51Ix3QI9qwYH2Ez",
        amount: order.amount,
        currency: "INR",
        name: "Delta Learning",
        description: `Purchase ${pointsAmount} points`,
        order_id: order.id,
        handler: async function (response: any) {
          console.log("Payment successful, verifying...", response);
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
              console.error("Verification error:", verifyResponse.error);
              toast({
                title: "Payment verification failed",
                description: "There was an error verifying your payment. Please contact support.",
                variant: "destructive",
              });
              return;
            }

            console.log("Payment verified successfully:", verifyResponse.data);
            toast({
              title: "Points purchased successfully!",
              description: `${pointsAmount} points have been added to your account`,
            });
            
            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            console.error("Error in payment verification:", error);
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
            console.log("Payment modal dismissed");
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
      console.error("Error initiating payment:", error);
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