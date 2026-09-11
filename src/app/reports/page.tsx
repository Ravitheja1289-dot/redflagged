import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Experiences",
  description:
    "Browse anonymous experiences, warning signs, and recognizable behavioral patterns shared by the community.",
  alternates: {
    canonical: "/reports",
  },
  openGraph: {
    title: "Explore Experiences | RedFlaggers",
    description:
      "Browse anonymous experiences, warning signs, and recognizable behavioral patterns shared by the community.",
    url: "https://redflaggers.vercel.app/reports",
  },
};

async function getReports() {
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from("reports")
    .select(`
      id, title, city, incident_year, public_pseudonym, narrative, advice, published_at, score,
      contexts(name),
      report_incident_types(incident_types(name)),
      report_behaviors(behaviors(name))
    `)
    .eq("status", "APPROVED")
    .order("published_at", { ascending: false })
    .limit(30);

  if (error || !data) {
    console.error("Failed to fetch reports", error?.message || error);
    return [];
  }

  const reportIds = data.map((r) => r.id);
  const { data: commentsData } = await publicSupabase
    .from("comments")
    .select("report_id")
    .in("report_id", reportIds)
    .eq("status", "APPROVED");

  const commentCounts = (commentsData || []).reduce((acc: any, c: any) => {
    acc[c.report_id] = (acc[c.report_id] || 0) + 1;
    return acc;
  }, {});

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    incidentTypes: row.report_incident_types.map(
      (r: any) => (r.incident_types as any).name
    ),
    context: (row.contexts as any)?.name || "Unknown",
    city: row.city,
    year: row.incident_year,
    narrative: row.narrative,
    behaviors: row.report_behaviors.map((r: any) => (r.behaviors as any).name),
    pseudonym: row.public_pseudonym,
    publishedAt: row.published_at,
    score: row.score || 0,
    commentCount: commentCounts[row.id] || 0,
  }));
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      <div className="max-w-2xl mx-auto pt-4 sm:pt-6 md:pt-8 px-3.5 sm:px-4 md:px-0 space-y-4 sm:space-y-6 md:space-y-8">
        <header className="px-1 pt-2 pb-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Explore Experiences
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Community-shared patterns and warning signs.
          </p>
        </header>

        {reports.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl bg-surface border border-soft-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-[#E53935] text-xl">
              ⚑
            </div>
            <p className="text-foreground font-semibold text-base mb-1.5">
              No experiences published yet
            </p>
            <p className="text-secondary text-xs sm:text-sm max-w-sm mx-auto">
              Submitted reports are currently being reviewed by community moderators.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <PostCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}
