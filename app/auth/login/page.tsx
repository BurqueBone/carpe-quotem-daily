"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Key } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/";
  const [method, setMethod] = useState<"magic" | "code">("code");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verify" | "magic-sent">("email");
  const [error, setError] = useState<string | null>(null);

  const maskedEmail = email
    ? `${email.charAt(0)}${"*".repeat(Math.max(0, email.indexOf("@") - 1))}${email.substring(email.indexOf("@"))}`
    : "";

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (method === "magic") {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", next);
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: callbackUrl.toString(),
          },
        });
        if (authError) {
          setError(authError.message);
        } else {
          setStep("magic-sent");
        }
      } else {
        // Email code — don't set emailRedirectTo so Supabase sends a code
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
        });
        if (authError) {
          setError(authError.message);
        } else {
          setStep("verify");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.push(next);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStep("email");
    setEmail("");
    setOtpCode("");
    setError(null);
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold text-brand-navy/60">
        Sign In
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Choose your preferred sign-in method
      </p>

      {/* Method tabs — only show on email step */}
      {step === "email" && (
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
      )}

      {/* Step 1: Enter email */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="mt-6">
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
            {method === "magic"
              ? "We'll send you a secure link — no password needed!"
              : "We'll send a 6-digit code to your email."}
          </p>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="mt-4 w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : method === "magic"
                ? "Send magic link"
                : "Send code"}
          </button>
        </form>
      )}

      {/* Step 2a: Magic link sent */}
      {step === "magic-sent" && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            We&apos;ve sent a magic link to{" "}
            <span className="font-semibold">{maskedEmail}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Click the link in your email to sign in.
          </p>
          <button
            onClick={resetForm}
            className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Send to a different email
          </button>
        </div>
      )}

      {/* Step 2b: Enter code */}
      {step === "verify" && (
        <form onSubmit={handleVerifyCode} className="mt-6">
          <p className="text-center text-sm text-gray-600">
            We sent a 6-digit code to{" "}
            <span className="font-semibold">{maskedEmail}</span>
          </p>

          <label
            htmlFor="otp"
            className="mt-5 block text-sm font-medium text-gray-700"
          >
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            required
            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-lg tracking-[0.3em] text-gray-700 placeholder:text-gray-300 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="mt-4 w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Use a different email
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
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-brand-cream/20 px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
