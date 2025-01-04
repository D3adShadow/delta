import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-16">
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-in">
              <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-700/20 mb-8">
                Now in Beta
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Learn. Earn.{" "}
                <span className="text-primary-500">Transform.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Join Delta's revolutionary learning platform where knowledge meets
                opportunity. Earn points, master new skills, and connect with
                industry leaders.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/courses"
                  className="group relative inline-flex items-center gap-x-2 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-all duration-200"
                >
                  Explore Courses
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/learn-more"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-500 transition-colors duration-200"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
};

export default Hero;