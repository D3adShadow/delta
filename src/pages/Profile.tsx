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

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: purchasedCourses } = useQuery({
    queryKey: ["purchased-courses", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("course_purchases")
        .select(`
          course_id,
          points_spent,
          courses (
            *,
            instructor:users(full_name)
          )
        `)
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
        <p className="text-xl text-gray-600">
          Points Balance: <span className="font-bold text-primary-600">{userData.points || 0}</span>
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchasedCourses?.map((purchase) => (
            <CourseCard
              key={purchase.course_id}
              id={purchase.course_id}
              title={purchase.courses.title}
              description={purchase.courses.description}
              instructor={purchase.courses.instructor?.full_name || "Delta Instructor"}
              duration="8 weeks"
              enrolled={42}
              image={purchase.courses.thumbnail_url || "/placeholder.svg"}
              points={purchase.points_spent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;