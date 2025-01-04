import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import UserHeader from "@/components/profile/UserHeader";
import UsersList from "@/components/profile/UsersList";
import PurchasedCourses from "@/components/profile/PurchasedCourses";

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
      <UserHeader userData={userData} />
      <UsersList users={allUsers} currentUserId={userId} />
      <PurchasedCourses courses={purchasedCourses} />
    </div>
  );
};

export default Profile;