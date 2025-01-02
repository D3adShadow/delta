import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CourseCard from "@/components/CourseCard";

const featuredCourses = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description:
      "Learn the fundamentals of machine learning and AI with hands-on projects and real-world applications.",
    instructor: "Dr. Sarah Chen",
    duration: "8 weeks",
    enrolled: 1234,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    points: 500,
  },
  {
    id: "2",
    title: "Web Development Masterclass",
    description:
      "Master modern web development with React, Node.js, and cloud technologies.",
    instructor: "Alex Rodriguez",
    duration: "12 weeks",
    enrolled: 2156,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    points: 750,
  },
  {
    id: "3",
    title: "Digital Marketing Essentials",
    description:
      "Learn proven strategies for growing your online presence and reaching your target audience.",
    instructor: "Emma Thompson",
    duration: "6 weeks",
    enrolled: 1789,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a",
    points: 400,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Start your learning journey with our most popular courses
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;