import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import TransactionHistory from "@/components/points/TransactionHistory";
import { Card } from "@/components/ui/card";

const POINTS_PACKAGES = [
  { amount: 100, price: "$10" },
  { amount: 500, price: "$45" },
  { amount: 1000, price: "$80" },
];

const Points = () => {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
      return;
    }

    console.log("User data fetched:", data);
    setUserPoints(data.points);
    setUserName(data.full_name);
  };

  const handlePurchasePoints = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase points",
          variant: "destructive",
        });
        return;
      }

      console.log("Purchasing points:", amount);
      const { data, error } = await supabase
        .from("users")
        .update({ points: (userPoints || 0) + amount })
        .eq("id", user.id)
        .select();

      if (error) throw error;

      console.log("Points updated:", data);
      setUserPoints(data[0].points);
      toast({
        title: "Points purchased successfully!",
        description: `${amount} points have been added to your account`,
      });
    } catch (error) {
      console.error("Error purchasing points:", error);
      toast({
        title: "Purchase failed",
        description: "There was an error purchasing points",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Points Overview Card */}
        <Card className="bg-white p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userName}'s Wallet</h1>
              <p className="text-lg text-gray-600 mt-2">
                Available Balance:{" "}
                <span className="font-semibold text-primary-600">
                  {userPoints || 0}
                </span>{" "}
                points
              </p>
            </div>
          </div>
        </Card>

        {/* Points Packages */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POINTS_PACKAGES.map((pkg) => (
              <Card
                key={pkg.amount}
                className="p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.amount} Points
                </h3>
                <p className="text-lg text-gray-600 mb-4">{pkg.price}</p>
                <Button
                  onClick={() => handlePurchasePoints(pkg.amount)}
                  className="w-full"
                  variant="default"
                >
                  Purchase
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Points;