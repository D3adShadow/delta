import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTestQuestions = (courseId: string) => {
  return useQuery({
    queryKey: ["test-questions", courseId],
    queryFn: async () => {
      console.log("Starting to fetch test questions for course:", courseId);
      
      // First verify the course exists
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
        throw new Error(`Course not found: ${courseError.message}`);
      }

      console.log("Found course:", courseData);

      // Then fetch ALL test questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("course_id", courseId)
        .order('created_at');

      if (questionsError) {
        console.error("Error fetching test questions:", questionsError);
        throw new Error(`Failed to fetch test questions: ${questionsError.message}`);
      }

      if (!questionsData || questionsData.length === 0) {
        console.log("No test questions found for course:", courseId);
        return [];
      }

      // Randomly select 20 unique questions
      const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, 20);

      console.log(`Selected ${selectedQuestions.length} unique test questions`);
      return selectedQuestions;
    },
  });
};