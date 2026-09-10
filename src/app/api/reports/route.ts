import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { generateManagementToken, hashToken } from '@/lib/crypto';

// Validation schema for report submission
const reportSchema = z.object({
  title: z.string().max(150).optional().default("Untitled Experience"),
  incidentTypeSlugs: z.array(z.string()).min(1),
  contextSlug: z.string().min(1),
  city: z.string().min(1).max(100),
  incidentYear: z.number().int().min(1900).max(new Date().getFullYear()),
  behaviorSlugs: z.array(z.string()).min(1),
  narrative: z.string().min(10).max(10000),
  advice: z.string().max(5000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // Generate management token
    const rawToken = generateManagementToken();
    const hashedToken = hashToken(rawToken);

    // Pseudonym generation (simple random adjective + noun for phase 2)
    // Could be expanded later, but we use a generic anonymous label for now.
    const publicPseudonym = `Anonymous ${Math.floor(Math.random() * 9000) + 1000}`;

    const supabase = getServiceSupabase();

    // Call the RPC function to insert everything in a transaction
    const { data: reportId, error } = await supabase.rpc('submit_report', {
      p_title: validatedData.title,
      p_context_slug: validatedData.contextSlug,
      p_city: validatedData.city,
      p_incident_year: validatedData.incidentYear,
      p_public_pseudonym: publicPseudonym,
      p_narrative: validatedData.narrative,
      p_advice: validatedData.advice || '',
      p_incident_type_slugs: validatedData.incidentTypeSlugs,
      p_behavior_slugs: validatedData.behaviorSlugs,
      p_token_hash: hashedToken,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json({ error: 'Failed to submit report to database' }, { status: 500 });
    }

    // Return the raw token to the user exactly once
    return NextResponse.json({
      success: true,
      reportId: reportId,
      managementToken: rawToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = getServiceSupabase();

    // We fetch APPROVED reports only (enforced by RLS, but we specify it anyway)
    // Actually, service role bypasses RLS! So we MUST explicitly filter.
    // Wait, if we use the service role, it bypasses RLS. We should use the standard client for public reads.
    const { createClient } = await import('@supabase/supabase-js');
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data, error, count } = await publicSupabase
      .from('reports')
      .select(`
        id, title, city, incident_year, public_pseudonym, narrative, advice, published_at,
        contexts(name),
        report_incident_types(incident_types(name)),
        report_behaviors(behaviors(name))
      `, { count: 'exact' })
      .eq('status', 'APPROVED')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    const formattedReports = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      incidentTypes: row.report_incident_types.map((r: any) => (r.incident_types as any).name),
      context: (row.contexts as any)?.name || 'Unknown',
      city: row.city,
      year: row.incident_year,
      narrative: row.narrative,
      advice: row.advice,
      behaviors: row.report_behaviors.map((r: any) => (r.behaviors as any).name),
      pseudonym: row.public_pseudonym,
      publishedAt: row.published_at,
    }));

    return NextResponse.json({
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
