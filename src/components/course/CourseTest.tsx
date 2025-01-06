import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface CourseTestProps {
  courseId: string;
  onComplete?: () => void;
}

const CourseTest = ({ courseId, onComplete }: CourseTestProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["test-questions", courseId],
    queryFn: async () => {
      console.log("Starting to fetch test questions for course:", courseId);
      
      const { data: questionsData, error: questionsError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at");

      if (questionsError) {
        console.error("Error fetching test questions:", questionsError);
        throw new Error(`Failed to fetch test questions: ${questionsError.message}`);
      }

      if (!questionsData || questionsData.length === 0) {
        console.log("No test questions found for course:", courseId);
        return [];
      }

      console.log(`Fetched ${questionsData.length} test questions:`, questionsData);
      return questionsData;
    },
  });

  const handleAnswerSelect = (value: string) => {
    console.log("Selected answer:", value, "for question:", currentQuestionIndex);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      console.log("Moving to next question:", currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      console.log("Moving to previous question:", currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    const score = questions.reduce((total, question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        return total + question.marks;
      }
      return total;
    }, 0);
    console.log("Calculated score:", score);
    return score;
  };

  const handleSubmit = async () => {
    if (!questions || selectedAnswers.length !== questions.length) {
      toast({
        title: "Please answer all questions",
        description: "You must answer all questions before submitting the test.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const score = calculateScore();
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
        description: `You scored ${score} out of ${maxScore} points (${Math.round((score/maxScore) * 100)}%).`,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-red-600">Error loading test</h3>
        <p className="text-gray-600 mt-2">
          {error instanceof Error ? error.message : "Failed to load test questions"}
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No test questions available</h3>
        <p className="text-gray-600 mt-2">
          The test for this course hasn't been created yet.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion.options as string[];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <span className="text-sm text-gray-600">
          {currentQuestion.marks} marks
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-lg">{currentQuestion.question}</p>

        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]?.toString()}
          onValueChange={handleAnswerSelect}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="text-base">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseTest;