import { Metadata } from "next";
import PriorityCheckIn from "@/components/priority-check-in";

export const metadata: Metadata = {
  title: "Simple Priority Check-in — Sunday4K",
  description:
    "Identify your top 3 priorities this week, see how much of your time aligns with what truly matters, and learn where to strategically underachieve.",
};

export default function SimplePriorityPage() {
  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-brand-navy md:text-5xl">
            Simple Priority Check-in
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg italic text-gray-500">
            &ldquo;Imagine you&rsquo;re 90, reflecting on a life well-lived.
            What did you spend your precious time on? What truly mattered in the
            end?&rdquo;
          </p>
        </div>
        <PriorityCheckIn />
      </div>
    </div>
  );
}
