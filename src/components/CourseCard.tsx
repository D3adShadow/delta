import { Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  enrolled: number;
  image: string;
  points: number;
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
}: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg"
    >
      <div className="aspect-h-9 aspect-w-16 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
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
          <div className="text-sm font-medium text-gray-700">
            By {instructor}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;