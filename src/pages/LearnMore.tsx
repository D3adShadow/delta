import Navigation from "@/components/Navigation";

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              About <span className="text-primary-500">Delta</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover how we're revolutionizing online education through our innovative learning platform.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {/* Feature 1 */}
            <div className="bg-secondary p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600">Learn from industry professionals and thought leaders in their respective fields.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn While You Learn</h3>
              <p className="text-gray-600">Accumulate points as you progress through courses and unlock new opportunities.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary p-6 rounded-lg">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Certificates</h3>
              <p className="text-gray-600">Receive recognized certificates upon course completion to showcase your achievements.</p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Course</h3>
                <p className="text-gray-600">Browse our extensive catalog of courses across various disciplines.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-2">Learn at Your Pace</h3>
                <p className="text-gray-600">Access course materials anytime, anywhere, and learn at your own speed.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-2">Earn & Achieve</h3>
                <p className="text-gray-600">Complete assignments, earn points, and receive your certification.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-primary-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
            <p className="text-lg text-gray-600 mb-6">Join thousands of students already learning on our platform.</p>
            <a
              href="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnMore;