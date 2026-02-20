import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

export const revalidate = 0;

const focusLabels: Record<string, string> = {
  meaningful_life: "Meaningful Life",
  resource_review: "Resource Review",
  memento_mori_research: "Memento Mori",
};

export default async function AdminBlogList() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, is_published, published_at, created_at, updated_at, blog_focus"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your blog content.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 font-medium text-gray-500">Title</th>
              <th className="hidden px-5 py-3 font-medium text-gray-500 sm:table-cell">
                Focus
              </th>
              <th className="hidden px-5 py-3 font-medium text-gray-500 sm:table-cell">
                Status
              </th>
              <th className="hidden px-5 py-3 font-medium text-gray-500 md:table-cell">
                Updated
              </th>
              <th className="px-5 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="font-medium text-gray-900 hover:text-brand-navy"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">/{post.slug}</p>
                </td>
                <td className="hidden px-5 py-3 sm:table-cell">
                  <span className="text-xs text-gray-500">
                    {post.blog_focus
                      ? focusLabels[post.blog_focus] || post.blog_focus
                      : "—"}
                  </span>
                </td>
                <td className="hidden px-5 py-3 sm:table-cell">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.is_published
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-gray-500 md:table-cell">
                  {new Date(post.updated_at || post.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-sm font-medium text-brand-navy hover:underline"
                    >
                      Edit
                    </Link>
                    {post.is_published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm text-gray-400 hover:text-gray-600"
                        target="_blank"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-gray-400"
                >
                  No blog posts yet.{" "}
                  <Link
                    href="/admin/blog/new"
                    className="font-medium text-brand-navy hover:underline"
                  >
                    Create your first post
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
