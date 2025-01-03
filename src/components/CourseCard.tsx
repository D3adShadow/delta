import { Clock, Users } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  enrolled: number;
  image: string;
  points: number;
  onPurchase?: () => void;
}

const CourseCard = ({
  id,
  title,
  description,
  instructor,
  duration,
  enrolled,
  image,
  points,
  onPurchase,
}: CourseCardProps) => {
  const { toast } = useToast();

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase courses",
          variant: "destructive",
        });
        return;
      }

      // First, ensure user profile exists
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name || "User",
          points: 500, // Default points if not set
        })
        .select()
        .single();

      if (userError) {
        console.error("Error ensuring user profile:", userError);
        throw new Error("Could not access user profile");
      }

      if (!userData) {
        toast({
          title: "Error",
          description: "Could not access user profile",
          variant: "destructive",
        });
        return;
      }

      if (userData.points < points) {
        toast({
          title: "Insufficient points",
          description: "You don't have enough points to purchase this course",
          variant: "destructive",
        });
        return;
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from("course_purchases")
        .insert({
          user_id: user.id,
          course_id: id,
          points_spent: points,
        });

      if (purchaseError) {
        console.error("Purchase error:", purchaseError);
        throw new Error("Failed to purchase course");
      }

      // Update user points
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: userData.points - points })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update points");
      }

      toast({
        title: "Course purchased successfully!",
        description: "You can now access this course from your profile",
      });

      if (onPurchase) {
        onPurchase();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: "There was an error purchasing the course",
        variant: "destructive",
      });
    }
  };

  // Use a default image if none is provided or if the image URL is invalid
  const courseImage = image || "https://moqmdhjobloazogqecti.supabase.co/storage/v1/object/public/course-thumbnails/default-course-image.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg">
      <div className="aspect-h-9 aspect-w-16 bg-gray-200 overflow-hidden">
        <img
          src={courseImage}
          alt={title}
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://moqmdhjobloazogqecti.supabase.co/storage/v1/object/public/course-thumbnails/default-course-image.jpg";
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          <div className="flex items-center gap-x-2">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
              {points} Points
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 group-hover:text-primary-500 transition-colors duration-200">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-x-6">
          <div className="flex items-center gap-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{enrolled} enrolled</span>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              By {instructor}
            </div>
            <Button onClick={handlePurchase} variant="default" size="sm">
              Purchase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;