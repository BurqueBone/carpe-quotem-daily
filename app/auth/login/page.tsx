"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Key } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [method, setMethod] = useState<"magic" | "code">("magic");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-brand-cream/20 px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-brand-navy/60">
          Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Choose your preferred sign-in method
        </p>

        {/* Method tabs */}
        <div className="mt-6 flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMethod("magic")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
              method === "magic"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="h-4 w-4" />
            Magic Link
          </button>
          <button
            onClick={() => setMethod("code")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
              method === "code"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Key className="h-4 w-4" />
            Email Code
          </button>
        </div>

        {sent ? (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              We&apos;ve sent a magic link to{" "}
              <span className="font-semibold">
                {email.charAt(0)}{"*".repeat(Math.max(0, email.indexOf("@") - 1))}
                {email.substring(email.indexOf("@"))}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Click the link in your email to sign in.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Send to a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
            <p className="mt-2 text-xs text-gray-400">
              We&apos;ll send you a secure link - no password needed!
            </p>

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="mt-4 w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-brand-navy hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
