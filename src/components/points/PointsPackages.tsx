import { Card } from "@/components/ui/card";
import PointsPackage from "./PointsPackage";
import { usePhonePePayment } from "@/hooks/usePhonePePayment";

const POINTS_PACKAGES = [
  { amount: 100, price: 100 },
  { amount: 500, price: 450 },
  { amount: 1000, price: 800 },
];

interface PointsPackagesProps {
  onPurchaseSuccess: () => void;
}

const PointsPackages = ({ onPurchaseSuccess }: PointsPackagesProps) => {
  const { handlePurchasePoints, isLoading } = usePhonePePayment({
    onSuccess: onPurchaseSuccess,
  });

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