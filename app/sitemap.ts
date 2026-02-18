import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, published_at")
    .eq("is_published", true);

  const blogEntries = (posts || []).map((post) => ({
    url: `https://sunday4k.life/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://sunday4k.life",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://sunday4k.life/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://sunday4k.life/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://sunday4k.life/carpe-diem",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://sunday4k.life/life-compass-calibration",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...blogEntries,
  ];
}
