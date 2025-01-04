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
      <div className="mb-4">
        <p className="text-3xl font-bold text-primary mb-1">₹{price}</p>
        <p className="text-sm text-gray-500">for</p>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {amount} Points
      </h3>
      <Button
        onClick={() => onPurchase(amount, price)}
        className="w-full"
        variant="default"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Purchase Now"}
      </Button>
    </Card>
  );
};

export default PointsPackage;