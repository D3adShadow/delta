import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import TransactionHistory from "@/components/points/TransactionHistory";
import PointsOverview from "@/components/points/PointsOverview";
import PointsPackage from "@/components/points/PointsPackage";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const POINTS_PACKAGES = [
  { amount: 100, price: 100 },
  { amount: 500, price: 450 },
  { amount: 1000, price: 800 },
];

const Points = () => {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchUserData(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for ID:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("points, full_name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching points:", error);
      toast({
        title: "Error",
        description: "Could not fetch your points balance",
        variant: "destructive",
      });
      return;
    }

    console.log("User data fetched:", data);
    setUserPoints(data.points);
    setUserName(data.full_name);
  };

  const handlePurchasePoints = async (pointsAmount: number, priceInRupees: number) => {
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

      console.log("Creating Razorpay order for user:", user.id);
      
      const orderResponse = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: priceInRupees,
          userId: user.id 
        },
      });

      if (orderResponse.error) {
        console.error("Error creating order:", orderResponse.error);
        throw new Error(orderResponse.error.message);
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
              throw new Error(verifyResponse.error.message);
            }

            console.log("Payment verified successfully:", verifyResponse.data);
            setUserPoints((prev) => (prev || 0) + pointsAmount);
            toast({
              title: "Points purchased successfully!",
              description: `${pointsAmount} points have been added to your account`,
            });
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast({
              title: "Payment verification failed",
              description: "There was an error verifying your payment",
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
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment failed",
        description: "There was an error initiating the payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <PointsOverview userName={userName} points={userPoints} />

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POINTS_PACKAGES.map((pkg) => (
              <PointsPackage
                key={pkg.amount}
                amount={pkg.amount}
                price={pkg.price}
                onPurchase={handlePurchasePoints}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
};

export default Points;