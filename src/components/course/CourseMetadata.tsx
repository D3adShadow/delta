import { Clock, Users } from "lucide-react";

interface CourseMetadataProps {
  duration: string;
  enrolled: number;
  instructor: string;
}

const CourseMetadata = ({ duration, enrolled, instructor }: CourseMetadataProps) => {
  return (
    <>
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
        <div className="text-sm font-medium text-gray-700">
          By {instructor}
        </div>
      </div>
    </>
  );
};

export default CourseMetadata;