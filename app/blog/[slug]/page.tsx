import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";
import MarkdownContent from "@/components/markdown-content";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  featured_image_url: string | null;
}

// Pre-build all published post slugs at build time
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  return (posts || []).map((post) => ({ slug: post.slug }));
}

// Dynamic metadata from post data
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, meta_title, meta_description, excerpt, featured_image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) return { title: "Post Not Found" };

  // Strip trailing "| Sunday4K" if present — the layout template adds it
  const rawTitle = post.meta_title || post.title;
  const title = rawTitle.replace(/\s*\|\s*Sunday4K$/i, "");
  const description =
    post.meta_description || post.excerpt || `Read ${post.title} on Sunday4K`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.featured_image_url && {
        images: [{ url: post.featured_image_url }],
      }),
    },
  };
}

export const revalidate = 3600;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single<BlogPost>();

  if (!post) notFound();

  const publishDate = post.published_at || post.created_at;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || "",
    datePublished: publishDate,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: "Sunday4K",
      url: "https://sunday4k.life",
    },
    publisher: {
      "@type": "Organization",
      name: "Sunday4K",
      url: "https://sunday4k.life",
    },
    ...(post.featured_image_url && {
      image: post.featured_image_url,
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-block text-sm font-medium text-brand-navy hover:underline"
          >
            &larr; Back to Blog
          </Link>

          <header className="mb-10">
            <time className="text-sm text-gray-400">
              {formatDate(publishDate)}
            </time>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-gray-500">
                {post.excerpt}
              </p>
            )}
          </header>

          <MarkdownContent content={post.content} />
        </div>
      </article>
    </>
  );
}
