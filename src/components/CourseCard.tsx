import { Button } from "./ui/button";
import CourseImage from "./course/CourseImage";
import CourseHeader from "./course/CourseHeader";
import CourseMetadata from "./course/CourseMetadata";
import { usePurchaseCourse } from "./course/usePurchaseCourse";
import { BookOpen, Play, TestTube } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  enrolled: number;
  image?: string;
  points: number;
  onPurchase?: () => void;
  hidePurchaseButton?: boolean;
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
  hidePurchaseButton = false,
}: CourseCardProps) => {
  const { handlePurchase, isPurchasing } = usePurchaseCourse({ id, points, onPurchase });

  const handleStartCourse = () => {
    console.log("Starting course:", id);
    // TODO: Implement course start functionality
  };

  const handleTakeTest = () => {
    console.log("Taking test for course:", id);
    // TODO: Implement test taking functionality
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg">
      <CourseImage 
        image={image || "https://moqmdhjobloazogqecti.supabase.co/storage/v1/object/public/course-thumbnails/default-course-image.jpg"} 
        title={title} 
      />
      
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          <CourseHeader title={title} description={description} points={points} />
        </div>
        
        <CourseMetadata 
          duration={duration}
          enrolled={enrolled}
          instructor={instructor}
        />
        
        {hidePurchaseButton ? (
          <div className="mt-4 flex justify-end gap-2">
            <Button 
              onClick={handleStartCourse} 
              variant="default" 
              size="sm"
            >
              <Play className="mr-1 h-4 w-4" />
              Start Course
            </Button>
            <Button 
              onClick={handleTakeTest} 
              variant="outline" 
              size="sm"
            >
              <TestTube className="mr-1 h-4 w-4" />
              Take Test
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handlePurchase} 
              variant="default" 
              size="sm"
              disabled={isPurchasing}
            >
              {isPurchasing ? "Processing..." : "Purchase"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;