import { posts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

// Statically generate routes at build time
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const PostPage = ({ params }: Props) => {
  const post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="prose lg:prose-xl max-w-none mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">{post.title}</h1>
        <p className="mt-2 text-gray-500">
          By {post.author} on {post.date}
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
};

export default PostPage;
