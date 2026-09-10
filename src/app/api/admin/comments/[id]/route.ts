import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REMOVE']),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = actionSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const targetStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'REMOVED';

    // Transaction-like approach: update status and insert audit log
    const { error: updateError } = await supabase
      .from('comments')
      .update({ status: targetStatus })
      .eq('id', id);

    if (updateError) {
      console.error('Comment action update error:', updateError);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    // Insert audit log
    await supabase.from('moderation_audit_logs').insert({
      action: `COMMENT_${targetStatus}`,
      target_type: 'COMMENT',
      target_id: id,
      admin_id: 'system' // Using generic system/admin since we use a single hardcoded credential
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Delete comment votes and flags
    await supabase.from('comment_votes').delete().eq('comment_id', id);
    await supabase.from('flags').delete().eq('target_type', 'COMMENT').eq('target_id', id);

    // Try hard delete, or fallback to soft delete if referenced as parent_id
    const { error: delError } = await supabase.from('comments').delete().eq('id', id);
    if (delError) {
      await supabase
        .from('comments')
        .update({ status: 'REMOVED', body: '[Comment removed by moderator]' })
        .eq('id', id);
    }

    await supabase.from('moderation_audit_logs').insert({
      action: 'COMMENT_DELETED',
      target_type: 'COMMENT',
      target_id: id,
      admin_id: 'system'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { body: commentBody } = body;

    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
      return NextResponse.json({ error: 'Comment body cannot be empty' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data, error } = await supabase
      .from('comments')
      .update({ body: commentBody.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, comment: data });
  } catch (error: any) {
    console.error('Admin edit comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to edit comment' }, { status: 500 });
  }
}
