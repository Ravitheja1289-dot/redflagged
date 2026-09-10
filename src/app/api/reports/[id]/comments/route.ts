import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { generateAnonymousPseudonym } from '@/lib/pseudonym';
import { checkRateLimit } from '@/lib/rate-limit';

const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long").trim(),
  parent_id: z.string().uuid().optional().nullable(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: comments, error } = await publicSupabase
      .from('comments')
      .select('id, parent_id, pseudonym, body, created_at, score')
      .eq('report_id', id)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch comments error:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    let userVotes: Record<string, number> = {};
    if (clientId && comments && comments.length > 0) {
      const { data: votes } = await adminSupabase
        .from('comment_votes')
        .select('comment_id, vote_type')
        .eq('client_id', clientId)
        .in('comment_id', comments.map(c => c.id));
        
      if (votes) {
        votes.forEach(v => {
          userVotes[v.comment_id] = v.vote_type;
        });
      }
    }

    const commentsWithVotes = (comments || []).map(c => ({
      ...c,
      userVote: userVotes[c.id] || 0
    }));

    return NextResponse.json({ comments: commentsWithVotes });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await checkRateLimit(ip, 'submit_comment', 5, 60000); // 5 per min
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY! // Need service role to insert into pending and bypass RLS or write securely
    );

    // Ensure the report exists and is APPROVED
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('status')
      .eq('id', id)
      .single();

    if (reportError || !report || report.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Cannot comment on this report' }, { status: 400 });
    }

    // Insert comment
    const pseudonym = generateAnonymousPseudonym();

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        report_id: id,
        parent_id: validatedData.parent_id || null,
        pseudonym,
        body: validatedData.body,
        status: 'PENDING'
      });

    if (insertError) {
      console.error('Insert comment error:', insertError);
      return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Comment submitted and awaiting moderation' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
