"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Heart,
  CalendarDays,
  UserRound,
  Mail,
  LogOut,
  Copy,
  Compass,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  email: string;
  birthdate: string | null;
  notificationsEnabled: boolean;
  quote: { quote: string; author: string; source: string | null } | null;
}

function SundayCounter({ birthdate }: { birthdate: string | null }) {
  const [date, setDate] = useState(birthdate || "");
  const [editing, setEditing] = useState(!birthdate);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function saveBirthdate() {
    if (!date) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ birthdate: date })
        .eq("id", user.id);
    }
    setSaving(false);
    setEditing(false);
  }

  async function removeBirthdate() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ birthdate: null })
        .eq("id", user.id);
    }
    setDate("");
    setSaving(false);
    setEditing(true);
  }

  const birthDate = date ? new Date(date + "T00:00:00") : null;
  const now = new Date();
  const sundaysExperienced = birthDate
    ? Math.floor(
        (now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      )
    : 0;
  const sundaysRemaining = Math.max(0, 4000 - sundaysExperienced);
  const pct = birthDate
    ? ((sundaysExperienced / 4000) * 100).toFixed(1)
    : "0.0";

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-brand-navy/60" />
        <h2 className="text-xl font-bold text-gray-900">
          Your Sunday Counter
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Track your Sundays experienced and celebrate the gift of time
      </p>

      <div className="mt-5">
        {editing ? (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
            <button
              onClick={saveBirthdate}
              disabled={!date || saving}
              className="rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Your Birthdate
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={removeBirthdate}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-brand-off-white px-4 py-3 text-center text-lg font-semibold text-gray-800">
              {birthDate
                ? birthDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-100 bg-brand-off-white/50 px-4 py-4 text-center">
                <div className="text-3xl font-bold text-brand-navy/70">
                  {sundaysExperienced.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Sundays experienced
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-brand-off-white/50 px-4 py-4 text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {sundaysRemaining.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Sundays remaining
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-sm text-gray-400">
              {pct}% of 4,000 Sundays
            </p>

            <Link
              href="/life-compass-calibration"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              <Compass className="h-4 w-4" />
              Calibrate Your Compass
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

function NotificationSettings({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("notification_settings")
        .upsert({ user_id: user.id, enabled }, { onConflict: "user_id" });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-brand-navy/60" />
        <h2 className="text-xl font-bold text-gray-900">
          Notification Settings
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Configure how often you&apos;d like to receive gentle reminders about
        life&apos;s preciousness
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Enable Notifications
          </p>
          <p className="text-xs text-gray-400">
            Receive daily inspiration and gentle reminders
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-brand-navy/70" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <p className="mt-3 text-sm text-gray-500">
          You&apos;ll receive one inspiring quote each morning to start your day
          with purpose.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </section>
  );
}

function ShareQuote({
  quote,
}: {
  quote: { quote: string; author: string; source: string | null } | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!quote) return null;

  const fullQuote = `"${quote.quote}"\n— ${quote.author}${quote.source ? `, ${quote.source}` : ""}`;

  function handleCopy() {
    navigator.clipboard.writeText(fullQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEmail() {
    const subject = encodeURIComponent("An inspiring quote for you");
    const body = encodeURIComponent(
      `${fullQuote}\n\nShared from Sunday4K — https://sunday4k.life`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-brand-navy/60" />
        <h2 className="text-xl font-bold text-gray-900">
          Share Today&apos;s Inspiration
        </h2>
      </div>

      <blockquote className="mt-4 rounded-lg border-l-4 border-brand-navy/20 bg-brand-off-white/50 px-5 py-4">
        <p className="italic text-gray-700">&ldquo;{quote.quote}&rdquo;</p>
        <footer className="mt-2 text-sm text-gray-500">
          — {quote.author}
          {quote.source && `, ${quote.source}`}
        </footer>
      </blockquote>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Spread positivity by sharing this inspiring quote with a friend
      </p>
    </section>
  );
}

function AccountSettings({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Confirmation email sent to your new address. Check your inbox."
      );
      setNewEmail("");
    }
    setSaving(false);
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <UserRound className="h-5 w-5 text-brand-navy/60" />
        <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Update your email address and password
      </p>

      <form onSubmit={handleChangeEmail} className="mt-5">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Change Email
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Current Email:{" "}
          <span className="font-medium text-gray-600">{email}</span>
        </p>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="New email address"
          className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
        />
        {message && (
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        )}
        <button
          type="submit"
          disabled={saving || !newEmail}
          className="mt-3 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Email"}
        </button>
      </form>
    </section>
  );
}

export default function ProfilePage({ initialData }: { initialData: ProfileData }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserRound className="h-7 w-7 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Sections */}
        <div className="mt-8 space-y-6">
          <NotificationSettings
            initialEnabled={initialData.notificationsEnabled}
          />
          <ShareQuote quote={initialData.quote} />
          <SundayCounter birthdate={initialData.birthdate} />
          <AccountSettings email={initialData.email} />
        </div>
      </div>
    </div>
  );
}
