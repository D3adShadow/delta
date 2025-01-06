import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useTestQuestions } from "./hooks/useTestQuestions";
import { useTestSubmission } from "./hooks/useTestSubmission";

interface CourseTestProps {
  courseId: string;
  onComplete?: () => void;
}

const CourseTest = ({ courseId, onComplete }: CourseTestProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  
  const { data: questions, isLoading, error } = useTestQuestions(courseId);
  const { handleSubmit, isSubmitting } = useTestSubmission(courseId, onComplete);

  const handleAnswerSelect = (answerIndex: number) => {
    console.log("Selected answer:", answerIndex, "for question:", currentQuestionIndex);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
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

        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-3"
            >
              <Button
                variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </Button>
            </div>
          ))}
        </div>
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
            onClick={() => handleSubmit(questions, selectedAnswers)}
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