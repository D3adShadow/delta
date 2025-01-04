import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import { Loader2 } from "lucide-react";

const PurchasedCourses = () => {
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["purchased-courses"],
    queryFn: async () => {
      console.log("Fetching purchased courses...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        return null;
      }

      const { data, error } = await supabase
        .from("course_purchases")
        .select(`
          *,
          courses (
            id,
            title,
            description,
            points_price,
            thumbnail_url,
            instructor:users!courses_instructor_id_fkey (
              full_name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Error fetching purchased courses:", error);
        throw error;
      }

      console.log("Fetched purchased courses:", data);
      return data;
    },
  });

  return (
    <div className="space-y-6 min-h-[400px]">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">My Courses</h2>
        <p className="text-gray-600 mt-1">
          {isLoading ? "Loading..." : `${purchases?.length || 0} course${purchases?.length !== 1 ? 's' : ''} purchased`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchases?.map((purchase) => (
              <CourseCard
                key={purchase.course_id}
                id={purchase.courses.id}
                title={purchase.courses.title}
                description={purchase.courses.description}
                instructor={purchase.courses.instructor?.full_name || "Delta Instructor"}
                duration="8 weeks"
                enrolled={42}
                points={purchase.points_spent}
                image={purchase.courses.thumbnail_url}
                hideImage={true}
                hidePurchaseButton={true}
              />
            ))}
          </div>

          {(!purchases || purchases.length === 0) && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No courses purchased yet</h3>
              <p className="mt-2 text-gray-600">
                Browse our available courses and start learning today!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PurchasedCourses;