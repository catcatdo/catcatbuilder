import Link from 'next/link';

// Simple SVG Icon Components for visual appeal
const ChartIcon = () => (
  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </div>
);

const BookIcon = () => (
  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
);

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-green-800 leading-tight">
          Grow Smarter, Not Harder
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Your complete guide to mastering the art and science of hydroponics. Unlock the full potential of your indoor garden.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300 transform hover:scale-105">
              View Dashboard
          </Link>
          <Link href="/blog" className="bg-white text-green-600 font-bold py-3 px-8 rounded-full border border-green-600 hover:bg-green-50 transition duration-300 transform hover:scale-105">
              Read Guides
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Dashboard Card */}
            <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-lg text-center flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300">
              <ChartIcon />
              <h3 className="text-2xl font-bold mt-4">Data-Driven Dashboard</h3>
              <p className="mt-2 text-gray-600 flex-grow">
                Visualize real-time data for your hydroponic garden. Track temperature, humidity, and pH levels to ensure optimal growth conditions.
              </p>
              <Link href="/dashboard" className="mt-6 inline-block bg-gray-100 px-6 py-2 rounded-full text-green-700 font-semibold hover:bg-green-200 transition-colors">
                Launch Dashboard &rarr;
              </Link>
            </div>

            {/* Blog Card */}
            <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-lg text-center flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300">
              <BookIcon />
              <h3 className="text-2xl font-bold mt-4">In-depth Guides</h3>
              <p className="mt-2 text-gray-600 flex-grow">
                Browse our collection of detailed articles on everything from setting up your first system to advanced cultivation techniques.
              </p>
              <Link href="/blog" className="mt-6 inline-block bg-gray-100 px-6 py-2 rounded-full text-green-700 font-semibold hover:bg-green-200 transition-colors">
                Explore Blog &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
