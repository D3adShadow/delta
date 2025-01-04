import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/CourseCard";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log("Fetching user data for ID:", userId);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
      console.log("User data:", data);
      return data;
    },
    enabled: !!userId,
  });

  const { data: allUsers, isLoading: isAllUsersLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      console.log("Fetching all users");
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }
      console.log("All users:", data);
      return data;
    },
  });

  const { data: purchasedCourses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["purchased-courses", userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching purchased courses for user:", userId);
      const { data, error } = await supabase
        .from("course_purchases")
        .select(`
          *,
          courses (
            id,
            title,
            description,
            points_price,
            instructor:users!courses_instructor_id_fkey (
              full_name
            )
          )
        `)
        .eq("user_id", userId)
        .order('purchased_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching purchased courses:", error);
        throw error;
      }
      
      console.log("Purchased courses:", data);
      return data;
    },
    enabled: !!userId,
  });

  if (isUserLoading || isCoursesLoading || isAllUsersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{userData?.full_name}</h1>
          <p className="text-lg text-gray-600">
            Available Points: <span className="font-semibold text-primary-600">{userData?.points || 0}</span>
          </p>
        </div>
      </div>

      {/* All Users Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">All Users</h2>
        <div className="divide-y divide-gray-200">
          {allUsers?.map((user) => (
            <div key={user.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    Points: {user.points}
                    {user.is_instructor && " • Instructor"}
                  </p>
                </div>
                {user.id === userId && (
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                    You
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchased Courses Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">My Courses</h2>
          <p className="text-gray-600 mt-1">
            {purchasedCourses?.length || 0} course{purchasedCourses?.length !== 1 ? 's' : ''} purchased
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchasedCourses?.map((purchase) => (
            <CourseCard
              key={purchase.course_id}
              id={purchase.courses.id}
              title={purchase.courses.title}
              description={purchase.courses.description}
              instructor={purchase.courses.instructor?.full_name || "Delta Instructor"}
              duration="8 weeks"
              enrolled={42}
              points={purchase.points_spent}
              hideImage={true}
            />
          ))}
        </div>

        {(!purchasedCourses || purchasedCourses.length === 0) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No courses purchased yet</h3>
            <p className="mt-2 text-gray-600">
              Browse our available courses and start learning today!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;