import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, ArrowRight } from "lucide-react";
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

const focusBadge: Record<string, { label: string; color: string }> = {
  meaningful_life: {
    label: "Meaningful Life",
    color: "bg-brand-navy/10 text-brand-navy",
  },
  resource_review: {
    label: "Resource Review",
    color: "bg-brand-gold/20 text-amber-700",
  },
  memento_mori_research: {
    label: "Memento Mori",
    color: "bg-brand-coral/10 text-brand-coral",
  },
};

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
      <div className="mx-auto max-w-4xl">
        {/* Header */}
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

        {/* Post cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {posts && posts.length > 0 ? (
            posts.map((post: BlogPost) => {
              const badge = post.blog_focus
                ? focusBadge[post.blog_focus]
                : null;

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Featured image */}
                  {post.featured_image_url ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-brand-navy/10 to-brand-gold/10">
                      <Newspaper className="h-12 w-12 text-brand-navy/20" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <time className="text-xs text-gray-400">
                        {formatDate(post.published_at || post.created_at)}
                      </time>
                      {badge && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-navy">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-navy">
                      Read more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="col-span-2 text-center text-gray-500">
              No posts published yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
