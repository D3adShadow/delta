import { Card } from "@/components/ui/card";

interface PointsOverviewProps {
  userName: string;
  points: number | null;
}

const PointsOverview = ({ userName, points }: PointsOverviewProps) => {
  return (
    <Card className="bg-white p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{userName}'s Wallet</h1>
          <p className="text-lg text-gray-600 mt-2">
            Available Balance:{" "}
            <span className="font-semibold text-primary-600">
              {points || 0}
            </span>{" "}
            points
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PointsOverview;