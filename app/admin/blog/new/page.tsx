import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogEditor from "@/components/admin/blog-editor";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin/blog/new");

  return <BlogEditor userId={user.id} />;
}
