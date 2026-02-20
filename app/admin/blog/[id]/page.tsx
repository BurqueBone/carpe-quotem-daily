import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogEditor from "@/components/admin/blog-editor";

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin/blog/${id}");

  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, content, excerpt, meta_title, meta_description, blog_focus, featured_image_url, is_published"
    )
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <BlogEditor
      post={{
        id: post.id,
        title: post.title || "",
        slug: post.slug || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        blog_focus: post.blog_focus || "meaningful_life",
        featured_image_url: post.featured_image_url || "",
        is_published: post.is_published,
      }}
      userId={user.id}
    />
  );
}
