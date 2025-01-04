import { User } from "@/types/user";

interface UserHeaderProps {
  userData: User | null;
}

const UserHeader = ({ userData }: UserHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{userData?.full_name}</h1>
        <p className="text-lg text-gray-600">
          Available Points: <span className="font-semibold text-primary-600">{userData?.points || 0}</span>
        </p>
      </div>
    </div>
  );
};

export default UserHeader;