import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssessmentResultsPage from "@/components/assessment-results-page";

export const metadata = {
  title: "Your Assessment Results | Life Compass Calibration",
  description:
    "View your Wheel of Life assessment results, track progress over time, and discover resources for growth.",
};

interface Assessment {
  id: string;
  satisfaction_scores: Record<string, number>;
  importance_scores: Record<string, number>;
  focus_areas: string[];
  created_at: string;
}

export default async function ResultsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/life-compass-calibration/results");
  }

  const { data: assessments } = await supabase
    .from("life_assessments")
    .select("id, satisfaction_scores, importance_scores, focus_areas, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!assessments || assessments.length === 0) {
    redirect("/life-compass-calibration/wheel-of-life-assessment");
  }

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <AssessmentResultsPage assessments={assessments as Assessment[]} />
      </div>
    </div>
  );
}
