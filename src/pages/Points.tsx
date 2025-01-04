import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import TransactionHistory from "@/components/points/TransactionHistory";
import PointsOverview from "@/components/points/PointsOverview";
import PointsPackages from "@/components/points/PointsPackages";

const Points = () => {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
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

  const handlePurchaseSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      fetchUserData(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <PointsOverview userName={userName} points={userPoints} />
        <PointsPackages onPurchaseSuccess={handlePurchaseSuccess} />
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Points;