import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTestSubmission = (courseId: string, onComplete?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const calculateScore = (questions: any[], selectedAnswers: number[]) => {
    const score = questions.reduce((total, question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        return total + question.marks;
      }
      return total;
    }, 0);
    console.log("Calculated score:", score);
    return score;
  };

  const handleSubmit = async (questions: any[], selectedAnswers: number[]) => {
    if (!questions || selectedAnswers.length !== questions.length) {
      toast({
        title: "Please answer all questions",
        description: "You must answer all questions before submitting the test.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const score = calculateScore(questions, selectedAnswers);
    const maxScore = questions.reduce((total, q) => total + q.marks, 0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Submitting test result:", { courseId, score, maxScore, userId: user.id });
      const { error } = await supabase.from("test_results").insert({
        course_id: courseId,
        user_id: user.id,
        score,
        max_score: maxScore,
      });

      if (error) {
        console.error("Error submitting test result:", error);
        throw error;
      }

      toast({
        title: "Test Completed!",
        description: `You scored ${score} out of ${maxScore} points.`,
      });

      onComplete?.();
    } catch (error) {
      console.error("Error submitting test result:", error);
      toast({
        title: "Error",
        description: "Failed to submit test results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};