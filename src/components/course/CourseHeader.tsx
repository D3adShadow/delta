interface CourseHeaderProps {
  title: string;
  description: string;
  points: number;
}

const CourseHeader = ({ title, description, points }: CourseHeaderProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-x-2">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
          {points} Points
        </span>
      </div>
      <h3 className="text-xl font-semibold leading-6 text-gray-900 group-hover:text-primary-500 transition-colors duration-200">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-gray-600 line-clamp-2">
        {description}
      </p>
    </div>
  );
};

export default CourseHeader;