import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Validate UUID format roughly to prevent DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

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

    if (error || !data) {
      // If error is PGRST116 (0 rows), return 404
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const formattedReport = {
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

    return NextResponse.json({ report: formattedReport });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
