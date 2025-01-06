import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsePurchaseCourseProps {
  id: string;
  points: number;
  onPurchase?: () => void;
}

export const usePurchaseCourse = ({ id, points, onPurchase }: UsePurchaseCourseProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPurchasing) return;
    
    setIsPurchasing(true);
    try {
      console.log("Starting purchase process for course:", id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase courses",
          variant: "destructive",
        });
        return;
      }

      // Validate UUID format
      if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error("Invalid course ID format:", id);
        toast({
          title: "Invalid course",
          description: "Could not process this course purchase",
          variant: "destructive",
        });
        return;
      }

      console.log("Checking for existing purchase...");
      // Check if user has already purchased the course
      const { data: existingPurchase, error: purchaseCheckError } = await supabase
        .from("course_purchases")
        .select()
        .eq("user_id", user.id)
        .eq("course_id", id)
        .maybeSingle();

      if (purchaseCheckError) {
        console.error("Error checking existing purchase:", purchaseCheckError);
        throw new Error("Failed to check purchase status");
      }

      if (existingPurchase) {
        toast({
          title: "Course already purchased",
          description: "You already own this course",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetching user profile...");
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        console.error("Error ensuring user profile:", userError);
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

      // Fetch course details for question generation
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("title, description")
        .eq("id", id)
        .single();

      if (courseError) {
        console.error("Error fetching course details:", courseError);
        throw new Error("Failed to fetch course details");
      }

      console.log("Creating purchase record...");
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
        if (purchaseError.code === "23505") {
          toast({
            title: "Course already purchased",
            description: "You already own this course",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to purchase course");
      }

      console.log("Updating user points...");
      // Update user points
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: userData.points - points })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update points");
      }

      // Generate test questions
      console.log("Generating test questions...");
      const { error: questionError } = await supabase.functions.invoke('generate-test-questions', {
        body: {
          courseId: id,
          courseTitle: courseData.title,
          courseDescription: courseData.description
        }
      });

      if (questionError) {
        console.error("Error generating questions:", questionError);
        // Don't throw error here, just log it as it's not critical
      }

      console.log("Purchase completed successfully!");
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
    } finally {
      setIsPurchasing(false);
    }
  };

  return { handlePurchase, isPurchasing };
};