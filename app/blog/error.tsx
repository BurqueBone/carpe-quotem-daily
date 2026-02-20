"use client";

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500">
        We couldn&apos;t load the blog. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
      >
        Try again
      </button>
    </div>
  );
}
