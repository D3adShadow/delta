import { Button } from "./ui/button";
import CourseImage from "./course/CourseImage";
import CourseHeader from "./course/CourseHeader";
import CourseMetadata from "./course/CourseMetadata";
import { usePurchaseCourse } from "./course/usePurchaseCourse";

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
        
        {!hidePurchaseButton && (
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