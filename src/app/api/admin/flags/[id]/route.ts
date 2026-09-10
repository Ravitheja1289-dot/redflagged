import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const actionSchema = z.object({
  type: z.enum(['REPORT_FLAG', 'COMMENT_FLAG']),
  action: z.enum(['DISMISSED', 'RESOLVED']), // RESOLVED usually implies we took down the content
  target_id: z.string().uuid()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, action, target_id } = actionSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const table = type === 'REPORT_FLAG' ? 'report_flags' : 'comment_flags';
    
    // Update the flag status
    const { error: updateError } = await supabase
      .from(table)
      .update({ status: action })
      .eq('id', id);

    if (updateError) {
      console.error('Flag action update error:', updateError);
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
    }

    // Insert audit log
    await supabase.from('moderation_audit_logs').insert({
      action: `${type}_${action}`,
      target_type: type,
      target_id: target_id,
      admin_id: 'system' 
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
