import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Fetch report flags
    const { data: reportFlags, error: rfError } = await supabase
      .from('report_flags')
      .select('id, report_id, reason, details, status, created_at')
      .eq('status', 'PENDING');

    if (rfError) throw rfError;

    // Fetch comment flags
    const { data: commentFlags, error: cfError } = await supabase
      .from('comment_flags')
      .select('id, comment_id, reason, details, status, created_at')
      .eq('status', 'PENDING');

    if (cfError) throw cfError;

    // Combine and format
    const flags = [
      ...(reportFlags || []).map(f => ({ ...f, type: 'REPORT_FLAG', target_id: f.report_id })),
      ...(commentFlags || []).map(f => ({ ...f, type: 'COMMENT_FLAG', target_id: f.comment_id }))
    ];

    // Sort by created_at descending
    flags.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ items: flags });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
