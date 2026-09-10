import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const flagSchema = z.object({
  targetType: z.enum(['REPORT', 'COMMENT']),
  targetId: z.string().uuid("Invalid target ID"),
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await checkRateLimit(ip, 'submit_flag', 5, 60000); // 5 per min
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = flagSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    let insertError;

    if (validatedData.targetType === 'REPORT') {
      const { error } = await supabase.from('report_flags').insert({
        report_id: validatedData.targetId,
        reason: validatedData.reason,
        details: validatedData.details,
        status: 'PENDING'
      });
      insertError = error;
    } else {
      const { error } = await supabase.from('comment_flags').insert({
        comment_id: validatedData.targetId,
        reason: validatedData.reason,
        details: validatedData.details,
        status: 'PENDING'
      });
      insertError = error;
    }

    if (insertError) {
      console.error('Insert flag error:', insertError);
      return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Thanks. We've sent this for review." });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
