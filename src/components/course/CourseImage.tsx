import { useState } from "react";

interface CourseImageProps {
  image: string;
  title: string;
}

const CourseImage = ({ image, title }: CourseImageProps) => {
  const [fallbackImage] = useState("https://moqmdhjobloazogqecti.supabase.co/storage/v1/object/public/course-thumbnails/default-course-image.jpg");

  return (
    <div className="aspect-h-9 aspect-w-16 bg-gray-200 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackImage;
        }}
      />
    </div>
  );
};

export default CourseImage;