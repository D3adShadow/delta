import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      console.log("Fetching courses...");
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          instructor:users!courses_instructor_id_fkey(full_name)
        `);
      
      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
      
      console.log("Fetched courses:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            instructor={course.instructor?.full_name || "Delta Instructor"}
            duration="8 weeks"
            enrolled={42}
            image={course.thumbnail_url}
            points={course.points_price}
            onPurchase={refetch}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;