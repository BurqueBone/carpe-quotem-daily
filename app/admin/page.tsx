import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  Users,
  Mail,
  Eye,
  ThumbsUp,
  Send,
  MessageSquare,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";

export const revalidate = 0;

interface DashboardStats {
  total_users: number;
  signups_7d: number;
  signups_30d: number;
  active_7d: number;
  active_30d: number;
  total_votes: number;
  votes_7d: number;
  unique_voters: number;
  emails_sent_total: number;
  emails_sent_7d: number;
  emails_sent_30d: number;
  active_notifications: number;
  contact_submissions: number;
  contact_submissions_7d: number;
  recent_users: {
    id: string;
    email: string;
    signed_up: string;
    last_active: string | null;
    is_admin: boolean;
    votes: number;
    emails_received: number;
  }[] | null;
  signup_trend: { week: string; signups: number }[] | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: publishedCount },
    { count: draftCount },
    { count: subscriberCount },
    { data: recentPosts },
    { data: dashboardStats },
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
      .from("blog_posts")
      .select("id, title, slug, is_published, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.rpc("get_admin_dashboard_stats"),
  ]);

  const stats = dashboardStats as unknown as DashboardStats | null;

  const topCards = [
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      sub: stats?.signups_7d ? `+${stats.signups_7d} this week` : null,
      icon: Users,
      color: "text-brand-navy bg-brand-navy/10",
    },
    {
      label: "Active (7d)",
      value: stats?.active_7d ?? 0,
      sub: stats?.active_30d ? `${stats.active_30d} in 30d` : null,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Published Posts",
      value: publishedCount ?? 0,
      sub: draftCount ? `${draftCount} drafts` : null,
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Emails Sent",
      value: stats?.emails_sent_total ?? 0,
      sub: stats?.emails_sent_7d ? `${stats.emails_sent_7d} this week` : null,
      icon: Send,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Resource Votes",
      value: stats?.total_votes ?? 0,
      sub: stats?.unique_voters
        ? `${stats.unique_voters} voter${stats.unique_voters !== 1 ? "s" : ""}`
        : null,
      icon: ThumbsUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Subscribers",
      value: subscriberCount ?? 0,
      sub: stats?.active_notifications
        ? `${stats.active_notifications} daily quotes`
        : null,
      icon: Mail,
      color: "text-pink-600 bg-pink-50",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your Sunday4K site.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topCards.map((stat) => (
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
            {stat.sub && (
              <p className="mt-2 text-xs text-gray-400">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout: Users + Recent Posts */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Users table */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Users</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    <Clock className="inline h-3.5 w-3.5" /> Last Active
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">
                    <ThumbsUp className="inline h-3.5 w-3.5" />
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">
                    <Mail className="inline h-3.5 w-3.5" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_users?.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800">
                          {user.email}
                        </span>
                        {user.is_admin && (
                          <Shield className="h-3.5 w-3.5 text-brand-navy" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Joined {formatDate(user.signed_up)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {timeAgo(user.last_active)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {user.votes || "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {user.emails_received || "—"}
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_users || stats.recent_users.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-gray-400"
                    >
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent posts */}
        <div>
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
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">
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
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-gray-900 hover:text-brand-navy"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
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

          {/* Contact submissions */}
          {(stats?.contact_submissions ?? 0) > 0 && (
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.contact_submissions}
                  </p>
                  <p className="text-xs text-gray-500">Contact Submissions</p>
                </div>
              </div>
              {(stats?.contact_submissions_7d ?? 0) > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  {stats?.contact_submissions_7d} this week
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
