import { User } from "@/types/user";

interface UsersListProps {
  users: User[] | null;
  currentUserId: string | null;
}

const UsersList = ({ users, currentUserId }: UsersListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">All Users</h2>
      <div className="divide-y divide-gray-200">
        {users?.map((user) => (
          <div key={user.id} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500">
                  Points: {user.points}
                  {user.is_instructor && " • Instructor"}
                </p>
              </div>
              {user.id === currentUserId && (
                <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                  You
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;