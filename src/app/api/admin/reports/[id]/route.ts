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
            title: rev.title,
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServiceSupabase();

    // Clean up relations
    await supabase.from('report_incident_types').delete().eq('report_id', id);
    await supabase.from('report_behaviors').delete().eq('report_id', id);
    await supabase.from('report_votes').delete().eq('report_id', id);
    
    // Get comment ids to delete comment votes
    const { data: comments } = await supabase.from('comments').select('id').eq('report_id', id);
    if (comments && comments.length > 0) {
      const commentIds = comments.map(c => c.id);
      await supabase.from('comment_votes').delete().in('comment_id', commentIds);
      await supabase.from('flags').delete().eq('target_type', 'COMMENT').in('target_id', commentIds);
    }

    await supabase.from('comments').delete().eq('report_id', id);
    await supabase.from('flags').delete().eq('target_type', 'REPORT').eq('target_id', id);
    await supabase.from('report_revisions').delete().eq('report_id', id);

    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete report error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete report' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, narrative, city, advice, incident_year } = body;

    const supabase = getServiceSupabase();
    const updateData: any = {};
    if (typeof title === 'string') updateData.title = title.trim();
    if (typeof narrative === 'string') updateData.narrative = narrative.trim();
    if (typeof city === 'string') updateData.city = city.trim();
    if (typeof advice === 'string') updateData.advice = advice.trim();
    if (typeof incident_year === 'number') updateData.incident_year = incident_year;

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report: data });
  } catch (error: any) {
    console.error('Admin edit report error:', error);
    return NextResponse.json({ error: error.message || 'Failed to edit report' }, { status: 500 });
  }
}
