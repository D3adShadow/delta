export interface CourseWithInstructor {
  id: string;
  title: string;
  description: string;
  points_price: number;
  instructor?: {
    full_name: string;
  };
}