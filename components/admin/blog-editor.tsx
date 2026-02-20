"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarkdownContent from "@/components/markdown-content";
import { Save, Eye, EyeOff, Trash2 } from "lucide-react";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  blog_focus: string;
  featured_image_url: string;
  is_published: boolean;
}

const EMPTY_POST: BlogPost = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  meta_title: "",
  meta_description: "",
  blog_focus: "meaningful_life",
  featured_image_url: "",
  is_published: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BlogEditor({
  post,
  userId,
}: {
  post?: BlogPost;
  userId: string;
}) {
  const router = useRouter();
  const isNew = !post?.id;
  const [form, setForm] = useState<BlogPost>(post || EMPTY_POST);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = useCallback(
    (field: keyof BlogPost, value: string | boolean) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-generate slug from title for new posts
        if (field === "title" && isNew) {
          next.slug = slugify(value as string);
        }
        return next;
      });
    },
    [isNew]
  );

  async function handleSave(publish?: boolean) {
    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const data: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      blog_focus: form.blog_focus || null,
      featured_image_url: form.featured_image_url || null,
    };

    if (publish !== undefined) {
      data.is_published = publish;
      if (publish) data.published_at = new Date().toISOString();
    }

    try {
      if (isNew) {
        data.author_id = userId;
        const { error: insertErr } = await supabase
          .from("blog_posts")
          .insert(data);
        if (insertErr) throw insertErr;
        setSuccess("Post created!");
        router.push("/admin/blog");
      } else {
        const { error: updateErr } = await supabase
          .from("blog_posts")
          .update(data)
          .eq("id", post.id);
        if (updateErr) throw updateErr;
        setSuccess("Saved!");
        setForm((prev) => ({
          ...prev,
          is_published: (data.is_published as boolean) ?? prev.is_published,
        }));
      }
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post?.id) return;
    if (!window.confirm("Delete this post permanently?")) return;

    setDeleting(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", post.id);

    if (delErr) {
      setError(delErr.message);
      setDeleting(false);
    } else {
      router.push("/admin/blog");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "New Post" : "Edit Post"}
        </h1>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
          {!isNew && (
            <button
              onClick={() => handleSave(!form.is_published)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {form.is_published ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Publish
                </>
              )}
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving || !form.title || !form.slug}
            className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Title & Slug */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Post title"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="post-slug"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Excerpt
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            placeholder="Brief summary for blog listing cards"
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>

        {/* Content with preview toggle */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Content (Markdown)
            </label>
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1 text-xs font-medium text-brand-navy hover:underline"
            >
              <Eye className="h-3 w-3" />
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="min-h-[400px] rounded-lg border border-gray-200 bg-white p-6">
              <MarkdownContent content={form.content} />
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Write your post in Markdown..."
              rows={20}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="mb-4 text-sm font-bold text-gray-700">SEO & Metadata</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Meta Title
              </label>
              <input
                type="text"
                value={form.meta_title}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder="Override page title for SEO"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Featured Image URL
              </label>
              <input
                type="text"
                value={form.featured_image_url}
                onChange={(e) =>
                  updateField("featured_image_url", e.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Meta Description
              </label>
              <textarea
                value={form.meta_description}
                onChange={(e) =>
                  updateField("meta_description", e.target.value)
                }
                placeholder="Short description for search results"
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Blog Focus
              </label>
              <select
                value={form.blog_focus}
                onChange={(e) => updateField("blog_focus", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              >
                <option value="meaningful_life">Meaningful Life</option>
                <option value="resource_review">Resource Review</option>
                <option value="memento_mori_research">Memento Mori</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
