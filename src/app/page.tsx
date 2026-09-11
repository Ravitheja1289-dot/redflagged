import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from '@supabase/supabase-js';
import { PostCard } from "@/components/PostCard";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "RedFlaggers — Recognize the red flags",
  description:
    "Anonymous experiences and recognizable patterns of harassment, toxic relationships, stalking, and workplace misconduct.",
  alternates: {
    canonical: "/",
  },
};

async function getReports() {
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from('reports')
    .select(`
      id, title, city, incident_year, public_pseudonym, narrative, advice, published_at, score,
      contexts(name),
      report_incident_types(incident_types(name)),
      report_behaviors(behaviors(name))
    `)
    .eq('status', 'APPROVED')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error || !data) {
    console.error('Failed to fetch reports', error?.message || error);
    return [];
  }

  // Fetch comment counts for these reports
  const reportIds = data.map(r => r.id);
  const { data: commentsData } = await publicSupabase
    .from('comments')
    .select('report_id')
    .in('report_id', reportIds)
    .eq('status', 'APPROVED');

  const commentCounts = (commentsData || []).reduce((acc: any, c: any) => {
    acc[c.report_id] = (acc[c.report_id] || 0) + 1;
    return acc;
  }, {});

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    incidentTypes: row.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (row.contexts as any)?.name || 'Unknown',
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

export default async function Home() {
  const reports = await getReports();

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      <div className="max-w-2xl mx-auto pt-4 sm:pt-6 md:pt-8 px-3.5 sm:px-4 md:px-0 space-y-4 sm:space-y-6 md:space-y-8">
        {reports.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-foreground font-medium mb-2">No experiences have been published yet.</p>
            <p className="text-secondary text-sm">Reports are currently under review.</p>
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
