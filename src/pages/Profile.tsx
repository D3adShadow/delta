import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import UserHeader from "@/components/profile/UserHeader";
import PurchasedCourses from "@/components/profile/PurchasedCourses";
import Navigation from "@/components/Navigation";

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

  if (isUserLoading || isCoursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <UserHeader userData={userData} />
        <PurchasedCourses courses={purchasedCourses} />
      </div>
    </div>
  );
};

export default Profile;