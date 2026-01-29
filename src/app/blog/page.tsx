import Link from 'next/link';
import { posts } from '@/lib/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'In-depth articles and guides on hydroponics.',
};

const BlogPage = () => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Hydroponics Knowledge Base</h1>
        <p className="mt-2 text-lg text-gray-600">Your source for guides, tips, and tutorials.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col transform group-hover:-translate-y-2 transition-transform duration-300">
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-green-700">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-2">{post.date} by {post.author}</p>
              <p className="mt-4 text-gray-600 flex-grow">{post.excerpt}</p>
              <span className="mt-4 font-semibold text-green-600 group-hover:underline">
                Read more &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
