import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const voteSchema = z.object({
  clientId: z.string().min(10),
  voteType: z.union([z.literal(1), z.literal(-1)]),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId');
  if (!clientId) return NextResponse.json({ vote: 0 });

  const { id } = await params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  
  const { data } = await supabase
    .from('report_votes')
    .select('vote_type')
    .eq('report_id', id)
    .eq('client_id', clientId)
    .single();

  return NextResponse.json({ vote: data?.vote_type || 0 });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await checkRateLimit(ip, 'vote', 30, 60000); 
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { error } = await supabase.rpc('vote_report', {
      p_report_id: id,
      p_client_id: validatedData.clientId,
      p_vote_type: validatedData.voteType
    });

    if (error) {
      console.error('Vote report error:', error);
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
