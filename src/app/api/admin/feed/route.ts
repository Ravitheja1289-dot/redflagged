import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id, title, city, incident_year, public_pseudonym, narrative, advice, published_at, score, status,
        contexts(name),
        report_incident_types(incident_types(name)),
        report_behaviors(behaviors(name))
      `)
      .eq('status', 'APPROVED')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Fetch feed error:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    const reportIds = (reports || []).map(r => r.id);
    const commentCounts: Record<string, number> = {};

    if (reportIds.length > 0) {
      const { data: comments } = await supabase
        .from('comments')
        .select('id, report_id, status')
        .in('report_id', reportIds);

      (comments || []).forEach(c => {
        if (c.status !== 'REJECTED' && c.status !== 'REMOVED') {
          commentCounts[c.report_id] = (commentCounts[c.report_id] || 0) + 1;
        }
      });
    }

    const formattedReports = (reports || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      incidentTypes: row.report_incident_types?.map((r: any) => r.incident_types?.name).filter(Boolean) || [],
      context: row.contexts?.name || 'Unknown',
      city: row.city,
      year: row.incident_year,
      narrative: row.narrative,
      advice: row.advice,
      behaviors: row.report_behaviors?.map((r: any) => r.behaviors?.name).filter(Boolean) || [],
      pseudonym: row.public_pseudonym,
      publishedAt: row.published_at,
      score: row.score || 0,
      status: row.status,
      commentCount: commentCounts[row.id] || 0,
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error: any) {
    console.error('Admin feed API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
