import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsePhonePePaymentProps {
  onSuccess?: () => void;
}

export const usePhonePePayment = ({ onSuccess }: UsePhonePePaymentProps = {}) => {
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

      console.log("[Payment] Creating PhonePe order", { userId: user.id, amount: priceInRupees });
      const orderResponse = await supabase.functions.invoke('create-phonepe-order', {
        body: { 
          amount: priceInRupees,
          userId: user.id,
          pointsAmount: pointsAmount,
          redirectUrl: window.location.origin
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
      
      console.log("[Payment] PhonePe order created successfully:", orderResponse.data);
      
      // Redirect to PhonePe payment page
      window.location.href = orderResponse.data.data.instrumentResponse.redirectInfo.url;

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