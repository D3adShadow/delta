import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PointsPackageProps {
  amount: number;
  price: number;
  onPurchase: (amount: number, price: number) => void;
  isLoading: boolean;
}

const PointsPackage = ({ amount, price, onPurchase, isLoading }: PointsPackageProps) => {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {amount} Points
      </h3>
      <p className="text-lg text-gray-600 mb-4">₹{price}</p>
      <Button
        onClick={() => onPurchase(amount, price)}
        className="w-full"
        variant="default"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Purchase"}
      </Button>
    </Card>
  );
};

export default PointsPackage;