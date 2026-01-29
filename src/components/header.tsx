import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-green-700 hover:text-green-600">
          🌿 Smart Hydroponics Guide
        </Link>
        <div className="space-x-6 text-lg">
          <Link href="/" className="text-gray-600 hover:text-green-700 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-green-700 transition-colors">
            Dashboard
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-green-700 transition-colors">
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
