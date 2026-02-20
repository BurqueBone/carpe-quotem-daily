import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, FileText, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block">
        <div className="flex h-full flex-col px-3 py-6">
          <p className="mb-6 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Admin
          </p>
          <nav className="flex flex-1 flex-col gap-1">
            <SidebarLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/admin/blog" icon={FileText} label="Blog Posts" />
          </nav>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 transition hover:text-brand-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="flex w-full flex-col">
        <nav className="flex gap-4 border-b border-gray-200 bg-white px-6 py-3 md:hidden">
          <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-brand-navy">
            Dashboard
          </Link>
          <Link href="/admin/blog" className="text-sm font-medium text-gray-600 hover:text-brand-navy">
            Blog Posts
          </Link>
          <Link href="/" className="ml-auto text-sm text-gray-400 hover:text-brand-navy">
            Back to site
          </Link>
        </nav>

        {/* Main content */}
        <div className="flex-1 px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-brand-off-white hover:text-brand-navy"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
