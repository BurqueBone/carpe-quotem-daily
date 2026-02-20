import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, Users, Mail, Eye } from "lucide-react";

export const revalidate = 0; // Always fresh

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: publishedCount },
    { count: draftCount },
    { count: subscriberCount },
    { count: activeNotifCount },
    { data: recentPosts },
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", false),
    supabase
      .from("email_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("notification_settings")
      .select("*", { count: "exact", head: true })
      .eq("enabled", true),
    supabase
      .from("blog_posts")
      .select("id, title, slug, is_published, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Published Posts",
      value: publishedCount ?? 0,
      icon: FileText,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Drafts",
      value: draftCount ?? 0,
      icon: Eye,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Email Subscribers",
      value: subscriberCount ?? 0,
      icon: Mail,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active Users",
      value: activeNotifCount ?? 0,
      icon: Users,
      color: "text-brand-navy bg-brand-navy/10",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your Sunday4K site.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Posts</h2>
          <Link
            href="/admin/blog"
            className="text-sm font-medium text-brand-navy hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="hidden px-5 py-3 font-medium text-gray-500 sm:table-cell">
                  Status
                </th>
                <th className="hidden px-5 py-3 font-medium text-gray-500 md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPosts?.map((post) => (
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
                    {new Date(
                      post.published_at || post.created_at
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentPosts || recentPosts.length === 0) && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
