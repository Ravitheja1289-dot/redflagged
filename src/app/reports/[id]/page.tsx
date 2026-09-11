import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReportDetail from "@/components/ReportDetail";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return {
      title: "Experience Not Found",
      robots: { index: false, follow: false },
    };
  }

  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from("reports")
    .select("id, title, narrative, published_at, created_at, status")
    .eq("id", id)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (error || !data) {
    return {
      title: "Experience Not Found",
      robots: { index: false, follow: false },
    };
  }

  const rawTitle = sanitizeString(data.title || "Community Warning Experience");
  const cleanTitle =
    rawTitle.length > 55 ? `${rawTitle.slice(0, 52)}...` : rawTitle;

  const rawNarrative = sanitizeString(data.narrative || "");
  const cleanDescription =
    rawNarrative.length > 150
      ? `${rawNarrative.slice(0, 147)}...`
      : rawNarrative ||
        "Read this anonymous experience and recognize warning signs and patterns.";

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `/reports/${id}`,
    },
    openGraph: {
      title: `${cleanTitle} | RedFlaggers`,
      description: cleanDescription,
      url: `https://redflaggers.vercel.app/reports/${id}`,
      type: "article",
      publishedTime: data.published_at || data.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanTitle} | RedFlaggers`,
      description: cleanDescription,
    },
  };
}

async function getReport(id: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from("reports")
    .select(`
      id, title, city, incident_year, public_pseudonym, narrative, advice, published_at,
      contexts(name),
      report_incident_types(incident_types(name)),
      report_behaviors(behaviors(name))
    `)
    .eq("id", id)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    incidentTypes: (data.report_incident_types || []).map(
      (r: any) => (r.incident_types as any)?.name
    ),
    context: (data.contexts as any)?.name || "Unknown",
    city: data.city,
    year: data.incident_year,
    narrative: data.narrative,
    advice: data.advice,
    behaviors: (data.report_behaviors || []).map(
      (r: any) => (r.behaviors as any)?.name
    ),
    pseudonym: data.public_pseudonym,
    publishedAt: data.published_at,
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportDetail report={report} />
    </div>
  );
}
