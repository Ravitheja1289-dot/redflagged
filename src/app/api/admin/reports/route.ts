import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceSupabase();
  
  // Fetch new pending reports
  const { data: newReports, error: newError } = await supabase
    .from('reports')
    .select(`
      id, city, incident_year, narrative, advice, status, public_pseudonym, created_at, moderator_feedback,
      contexts(name),
      report_incident_types(incident_types(name)),
      report_behaviors(behaviors(name))
    `)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  if (newError) {
    return NextResponse.json({ error: newError.message }, { status: 500 });
  }

  // Fetch pending revisions (edits)
  const { data: revisions, error: revError } = await supabase
    .from('report_revisions')
    .select(`
      id, report_id, narrative, advice, city, incident_year, status, created_at, moderator_feedback,
      reports(public_pseudonym, contexts(name), report_incident_types(incident_types(name)), report_behaviors(behaviors(name)))
    `)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  if (revError) {
    return NextResponse.json({ error: revError.message }, { status: 500 });
  }

  // Format reports
  const formattedReports = newReports.map((row: any) => ({
    type: 'NEW_REPORT',
    id: row.id,
    reportId: row.id,
    city: row.city,
    year: row.incident_year,
    narrative: row.narrative,
    advice: row.advice,
    pseudonym: row.public_pseudonym,
    createdAt: row.created_at,
    moderatorFeedback: row.moderator_feedback,
    incidentTypes: row.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (row.contexts as any)?.name || 'Unknown',
    behaviors: row.report_behaviors.map((r: any) => (r.behaviors as any).name),
  }));

  // Format revisions
  const formattedRevisions = revisions.map((row: any) => ({
    type: 'REVISION',
    id: row.id,
    reportId: row.report_id,
    city: row.city,
    year: row.incident_year,
    narrative: row.narrative,
    advice: row.advice,
    pseudonym: row.reports.public_pseudonym,
    createdAt: row.created_at,
    moderatorFeedback: row.moderator_feedback,
    incidentTypes: row.reports.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (row.reports.contexts as any)?.name || 'Unknown',
    behaviors: row.reports.report_behaviors.map((r: any) => (r.behaviors as any).name),
  }));

  // Combine and sort by createdAt
  const allPending = [...formattedReports, ...formattedRevisions].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() // Oldest first for queue
  );

  return NextResponse.json({ items: allPending });
}
