import { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, reviews, and insights on intentional living — plan your weeks, grow in every life area, and make your time count.",
};

export const revalidate = 3600;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  blog_focus: string | null;
  featured_image_url: string | null;
}

export default async function BlogPage() {
  const supabase = createStaticClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, published_at, created_at, blog_focus, featured_image_url"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
          <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
              <Newspaper className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Blog
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Guides and insights on intentional living, weekly planning, and
                making your time count.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {posts && posts.length > 0 ? (
            posts.map((post: BlogPost) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <time className="text-sm text-gray-400">
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-800 transition-colors group-hover:text-brand-navy">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 leading-relaxed text-gray-600">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-brand-navy">
                    Read more &rarr;
                  </span>
                </Link>
              </article>
            ))
          ) : (
            <p className="text-gray-500">No posts published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
