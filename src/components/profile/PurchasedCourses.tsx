import { CourseWithInstructor } from "@/types/course";
import CourseCard from "@/components/CourseCard";

interface PurchasedCoursesProps {
  courses: any[] | null;
}

const PurchasedCourses = ({ courses }: PurchasedCoursesProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">My Courses</h2>
        <p className="text-gray-600 mt-1">
          {courses?.length || 0} course{courses?.length !== 1 ? 's' : ''} purchased
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.map((purchase) => (
          <CourseCard
            key={purchase.course_id}
            id={purchase.courses.id}
            title={purchase.courses.title}
            description={purchase.courses.description}
            instructor={purchase.courses.instructor?.full_name || "Delta Instructor"}
            duration="8 weeks"
            enrolled={42}
            points={purchase.points_spent}
            hideImage={true}
          />
        ))}
      </div>

      {(!courses || courses.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No courses purchased yet</h3>
          <p className="mt-2 text-gray-600">
            Browse our available courses and start learning today!
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchasedCourses;