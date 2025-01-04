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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase courses",
          variant: "destructive",
        });
        return;
      }

      // Check if user has already purchased the course
      const { data: existingPurchase } = await supabase
        .from("course_purchases")
        .select()
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      if (existingPurchase) {
        toast({
          title: "Course already purchased",
          description: "You already own this course",
          variant: "destructive",
        });
        return;
      }

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name || "User",
          points: 500,
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
    } finally {
      setIsPurchasing(false);
    }
  };

  return { handlePurchase, isPurchasing };
};