import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/profile-page";

export const metadata: Metadata = {
  title: "Profile — Sunday4K",
  description: "Manage your Sunday4K profile, notification settings, and Sunday Counter.",
};

export default async function Profile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const [{ data: profile }, { data: notifSettings }, { data: quote }] =
    await Promise.all([
      supabase.from("profiles").select("birthdate").eq("id", user.id).single(),
      supabase
        .from("notification_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .single(),
      supabase.rpc("get_random_quote_and_track"),
    ]);

  return (
    <ProfilePage
      initialData={{
        email: user.email || "",
        birthdate: profile?.birthdate || null,
        notificationsEnabled: notifSettings?.enabled ?? true,
        quote: quote
          ? { quote: quote.quote, author: quote.author, source: quote.source }
          : null,
      }}
    />
  );
}
