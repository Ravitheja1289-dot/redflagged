import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashToken } from '@/lib/crypto';
import { z } from 'zod';

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const hashedToken = hashToken(token);
    const supabase = getServiceSupabase();

    // Find the report id associated with this token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('report_management_tokens')
      .select('report_id')
      .eq('token_hash', hashedToken)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired management token' }, { status: 401 });
    }

    const reportId = tokenRecord.report_id;

    // Fetch the report status and current content
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id, title, city, incident_year, public_pseudonym, narrative, advice, status, moderator_feedback,
        contexts(slug),
        report_incident_types(incident_types(slug)),
        report_behaviors(behaviors(slug))
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if there is a pending revision
    const { data: revision } = await supabase
      .from('report_revisions')
      .select('status, created_at, moderator_feedback, title')
      .eq('report_id', reportId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      report: {
        id: report.id,
        title: revision?.title || report.title,
        status: report.status,
        city: report.city,
        year: report.incident_year,
        narrative: report.narrative,
        advice: report.advice,
        contextSlug: (report.contexts as any)?.slug,
        incidentTypeSlugs: report.report_incident_types.map((r: any) => (r.incident_types as any).slug),
        behaviorSlugs: report.report_behaviors.map((r: any) => (r.behaviors as any).slug),
      },
      hasPendingRevision: !!revision,
      revisionStatus: revision?.status || null,
      feedback: revision?.moderator_feedback || report.moderator_feedback || null
    });
  } catch (error) {
    console.error('Manage API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const editSchema = z.object({
  title: z.string().min(3).max(150),
  narrative: z.string().min(10).max(10000),
  advice: z.string().max(5000).optional(),
  city: z.string().min(1).max(100),
  incidentYear: z.number().int().min(1900).max(new Date().getFullYear()),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await request.json();
    const validatedData = editSchema.parse(body);

    const hashedToken = hashToken(token);
    const supabase = getServiceSupabase();

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('report_management_tokens')
      .select('report_id')
      .eq('token_hash', hashedToken)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = tokenRecord.report_id;

    // Create a new pending revision
    const { error: revisionError } = await supabase
      .from('report_revisions')
      .insert({
        report_id: reportId,
        title: validatedData.title,
        narrative: validatedData.narrative,
        advice: validatedData.advice || '',
        city: validatedData.city,
        incident_year: validatedData.incidentYear,
        status: 'PENDING'
      });

    if (revisionError) {
      console.error('Revision creation error:', revisionError);
      return NextResponse.json({ error: 'Failed to submit edit for review' }, { status: 500 });
    }

    // Also set the main report status to PENDING so it disappears from public view until reviewed
    await supabase
      .from('reports')
      .update({ status: 'PENDING' })
      .eq('id', reportId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Manage API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const hashedToken = hashToken(token);
    const supabase = getServiceSupabase();

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('report_management_tokens')
      .select('report_id')
      .eq('token_hash', hashedToken)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set status to REMOVED
    const { error: updateError } = await supabase
      .from('reports')
      .update({ status: 'REMOVED' })
      .eq('id', tokenRecord.report_id);

    if (updateError) {
      console.error('Deletion error:', updateError);
      return NextResponse.json({ error: 'Failed to request deletion' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manage API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
