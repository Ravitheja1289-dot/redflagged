import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, action, feedback } = body; 
    // type: 'NEW_REPORT' | 'REVISION'
    // action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

    const supabase = getServiceSupabase();

    if (action === 'REQUEST_CHANGES') {
      if (type === 'NEW_REPORT') {
        const { error } = await supabase.from('reports').update({ moderator_feedback: feedback }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('report_revisions').update({ moderator_feedback: feedback }).eq('id', id);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'REJECT') {
      if (type === 'NEW_REPORT') {
        const { error } = await supabase.from('reports').update({ status: 'REJECTED' }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('report_revisions').update({ status: 'REJECTED' }).eq('id', id);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'APPROVE') {
      if (type === 'NEW_REPORT') {
        const { error } = await supabase.from('reports')
          .update({ 
            status: 'APPROVED', 
            published_at: new Date().toISOString(),
            moderator_feedback: null 
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        // Approving a revision
        // 1. Fetch revision
        const { data: rev, error: fetchErr } = await supabase.from('report_revisions').select('*').eq('id', id).single();
        if (fetchErr) throw fetchErr;

        // 2. Update main report
        const { error: repErr } = await supabase.from('reports')
          .update({
            narrative: rev.narrative,
            advice: rev.advice,
            city: rev.city,
            incident_year: rev.incident_year,
            status: 'APPROVED',
            moderator_feedback: null
          })
          .eq('id', rev.report_id);
        if (repErr) throw repErr;

        // 3. Update revision status
        const { error: revUpdateErr } = await supabase.from('report_revisions')
          .update({ status: 'APPROVED', moderator_feedback: null })
          .eq('id', id);
        if (revUpdateErr) throw revUpdateErr;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Admin update error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
