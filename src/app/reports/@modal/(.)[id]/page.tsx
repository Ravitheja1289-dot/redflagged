import { notFound } from "next/navigation";
import ReportDetail from "@/components/ReportDetail";
import { Modal } from "./Modal";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getReport(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

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
    .eq('id', id)
    .eq('status', 'APPROVED')
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    incidentTypes: data.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (data.contexts as any)?.name || 'Unknown',
    city: data.city,
    year: data.incident_year,
    narrative: data.narrative,
    advice: data.advice,
    behaviors: data.report_behaviors.map((r: any) => (r.behaviors as any).name),
    pseudonym: data.public_pseudonym,
    publishedAt: data.published_at,
  };
}

export default async function ReportModalPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <Modal>
      <ReportDetail report={report} isModal={true} />
    </Modal>
  );
}
