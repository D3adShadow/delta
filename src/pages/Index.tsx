import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CourseCard from "@/components/CourseCard";

const featuredCourses = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
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
    id: "223e4567-e89b-12d3-a456-426614174001",
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
    id: "323e4567-e89b-12d3-a456-426614174002",
    title: "Digital Marketing Essentials",
    description:
      "Learn proven strategies for growing your online presence and reaching your target audience.",
    instructor: "Emma Thompson",
    duration: "6 weeks",
    enrolled: 1789,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a",
    points: 400,
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    title: "Data Science Fundamentals",
    description: "Explore data analysis, visualization, and statistical methods using Python and R.",
    instructor: "Dr. Michael Chang",
    duration: "10 weeks",
    enrolled: 1567,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    points: 600,
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    title: "Advanced JavaScript Programming",
    description: "Deep dive into advanced JavaScript concepts, design patterns, and modern frameworks.",
    instructor: "James Wilson",
    duration: "8 weeks",
    enrolled: 2341,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    points: 800,
  },
  {
    id: "623e4567-e89b-12d3-a456-426614174005",
    title: "UX/UI Design Principles",
    description: "Master the fundamentals of user experience and interface design for digital products.",
    instructor: "Sofia Garcia",
    duration: "6 weeks",
    enrolled: 1890,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    points: 550,
  },
  {
    id: "723e4567-e89b-12d3-a456-426614174006",
    title: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native and Flutter.",
    instructor: "David Kim",
    duration: "10 weeks",
    enrolled: 1678,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    points: 700,
  },
  {
    id: "823e4567-e89b-12d3-a456-426614174007",
    title: "Cybersecurity Basics",
    description: "Learn essential cybersecurity concepts and practices to protect digital assets.",
    instructor: "Robert Smith",
    duration: "8 weeks",
    enrolled: 1432,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    points: 650,
  },
  {
    id: "923e4567-e89b-12d3-a456-426614174008",
    title: "Cloud Computing Fundamentals",
    description: "Master cloud services and deployment using AWS, Azure, and Google Cloud.",
    instructor: "Lisa Johnson",
    duration: "12 weeks",
    enrolled: 2089,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    points: 750,
  },
  {
    id: "a23e4567-e89b-12d3-a456-426614174009",
    title: "Business Analytics",
    description: "Learn to make data-driven business decisions using analytics tools and techniques.",
    instructor: "Mark Anderson",
    duration: "8 weeks",
    enrolled: 1567,
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    points: 600,
  },
  {
    id: "b23e4567-e89b-12d3-a456-426614174010",
    title: "Artificial Intelligence Ethics",
    description: "Explore ethical considerations and implications of AI development.",
    instructor: "Dr. Rachel Lee",
    duration: "6 weeks",
    enrolled: 1234,
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    points: 450,
  },
  {
    id: "c23e4567-e89b-12d3-a456-426614174011",
    title: "Project Management Essentials",
    description: "Master the fundamentals of project management and agile methodologies.",
    instructor: "Thomas Brown",
    duration: "8 weeks",
    enrolled: 1890,
    image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c",
    points: 500,
  },
  {
    id: "d23e4567-e89b-12d3-a456-426614174012",
    title: "Blockchain Development",
    description: "Learn to build decentralized applications and smart contracts.",
    instructor: "Andrew Martinez",
    duration: "12 weeks",
    enrolled: 1345,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    points: 900,
  },
  {
    id: "e23e4567-e89b-12d3-a456-426614174013",
    title: "Content Marketing Strategy",
    description: "Develop effective content strategies for digital marketing success.",
    instructor: "Emily White",
    duration: "6 weeks",
    enrolled: 1678,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    points: 450,
  },
  {
    id: "f23e4567-e89b-12d3-a456-426614174014",
    title: "DevOps Engineering",
    description: "Master continuous integration, deployment, and modern DevOps practices.",
    instructor: "Chris Taylor",
    duration: "10 weeks",
    enrolled: 1923,
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    points: 800,
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