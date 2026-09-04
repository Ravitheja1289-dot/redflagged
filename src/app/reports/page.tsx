import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ReportFilters } from "@/components/ReportFilters";
import { createClient } from '@supabase/supabase-js';

// Ensure this page is rendered dynamically to fetch the latest reports
export const dynamic = 'force-dynamic';

async function getReports() {
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from('reports')
    .select(`
      id, city, incident_year, public_pseudonym, narrative, advice, published_at,
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

  return data.map((row: any) => ({
    id: row.id,
    incidentTypes: row.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (row.contexts as any)?.name || 'Unknown',
    city: row.city,
    year: row.incident_year,
    excerpt: row.narrative.length > 150 ? row.narrative.substring(0, 150) + '...' : row.narrative,
    behaviors: row.report_behaviors.map((r: any) => (r.behaviors as any).name),
    pseudonym: row.public_pseudonym,
    commentCount: 0, // Placeholder
  }));
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Reveal>
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Explore experiences</h1>
            <p className="text-sm text-secondary max-w-lg">
              Anonymous experiences shared to help identify recurring warning signs.
            </p>
          </div>
          
          <div className="w-full md:w-auto md:min-w-[400px]">
            <ReportFilters />
          </div>
        </div>
      </Reveal>

      {reports.length === 0 ? (
        <Reveal delay={200}>
          <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
            <p className="text-foreground font-medium mb-2">No experiences have been published yet.</p>
            <p className="text-secondary text-sm">Reports are currently under review.</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, i) => (
            <Reveal key={report.id} delay={i * 60} className="h-full">
              <Link href={`/reports/${report.id}`} className="block group card-hover h-full">
                <div className="bg-surface border border-soft-border rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-accent tracking-wider">{report.incidentTypes[0]}</span>
                    <span className="text-xs text-secondary">{report.year}</span>
                  </div>
                  <div className="text-sm text-secondary mb-4">
                    {report.context} &middot; {report.city}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6 italic">
                    &quot;{report.excerpt}&quot;
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {report.behaviors.map((b: string) => (
                      <span key={b} className="text-xs bg-accent-secondary/30 border border-accent-secondary/40 px-2 py-1 rounded-md text-foreground font-medium">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-soft-border pt-4 mt-4">
                    <span className="text-sm font-medium text-secondary">{report.pseudonym}</span>
                    <span className="text-sm text-secondary group-hover:text-foreground transition-colors">{report.commentCount} comments</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
