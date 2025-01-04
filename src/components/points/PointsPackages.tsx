import { Card } from "@/components/ui/card";
import PointsPackage from "./PointsPackage";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const POINTS_PACKAGES = [
  { amount: 100, price: 100 },
  { amount: 500, price: 450 },
  { amount: 1000, price: 800 },
];

interface PointsPackagesProps {
  onPurchaseSuccess: () => void;
}

const PointsPackages = ({ onPurchaseSuccess }: PointsPackagesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchasePoints = async (pointsAmount: number, priceInRupees: number) => {
    setIsLoading(true);
    try {
      // Temporary placeholder for payment integration
      toast({
        title: "Payment Integration Required",
        description: "Payment gateway integration is currently unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default PointsPackages;