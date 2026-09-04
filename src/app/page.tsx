import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getRecentReports() {
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await publicSupabase
    .from('reports')
    .select(`
      id, city, incident_year, public_pseudonym, narrative, published_at,
      contexts(name),
      report_incident_types(incident_types(name)),
      report_behaviors(behaviors(name))
    `)
    .eq('status', 'APPROVED')
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !data) {
    console.error('Failed to fetch recent reports', error?.message || error);
    return [];
  }
  
  return data.map((row: any) => ({
    id: row.id,
    incidentTypes: row.report_incident_types.map((r: any) => (r.incident_types as any).name),
    context: (row.contexts as any)?.name || 'Unknown',
    city: row.city,
    year: row.incident_year,
    excerpt: row.narrative.length > 150 ? row.narrative.substring(0, 150) + '...' : row.narrative,
    behaviors: row.report_behaviors.map((r: any) => (r.behaviors as any).name),
    pseudonym: row.public_pseudonym,
    commentCount: 0,
  }));
}

export default async function Home() {
  const recentReports = await getRecentReports();

  return (
    <div className="flex flex-col w-full">
      {/* 100vh Hero Section */}
      <section className="relative min-h-[100svh] flex flex-col justify-center items-center px-4 -mt-16 pt-16 overflow-hidden">
        {/* Subtle Ambient Background Animation */}
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-tr from-background via-surface to-background opacity-60 animate-hero-bg" 
          style={{ backgroundSize: '200% 200%' }} 
        />
        
        <div className="container relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-6 opacity-0 animate-fade-in-up animate-stagger-1 will-change-[opacity,transform]">
            Recognize the red flags.
          </h1>
          
          <div className="opacity-0 animate-fade-in-up animate-stagger-2 will-change-[opacity,transform] mb-10 text-xl md:text-2xl text-secondary flex flex-col gap-1">
            <span>Anonymous experiences.</span>
            <span>Recognizable patterns.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto opacity-0 animate-fade-in-up animate-stagger-3 will-change-[opacity,transform]">
            <Link 
              href="/reports" 
              className="px-8 py-3.5 bg-foreground text-surface rounded-full font-medium hover:bg-foreground/90 w-full sm:w-auto btn-interaction shadow-sm text-center"
            >
              Explore experiences
            </Link>
            <Link 
              href="/submit" 
              className="px-8 py-3.5 bg-accent text-surface rounded-full font-medium hover:bg-accent/90 w-full sm:w-auto btn-interaction shadow-sm text-center"
            >
              Share anonymously
            </Link>
          </div>
        </div>
      </section>

      {/* Why RedFlaggers */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Why RedFlaggers?</h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                One experience can be hard to recognize.<br/>
                Patterns are easier to see.
              </p>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            <Reveal delay={100}>
              <div className="flex flex-col">
                <span className="text-accent font-semibold mb-2 text-sm uppercase tracking-wider">Experiences</span>
                <p className="text-foreground text-lg font-medium">Anonymous accounts.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col">
                <span className="text-accent font-semibold mb-2 text-sm uppercase tracking-wider">Patterns</span>
                <p className="text-foreground text-lg font-medium">Recurring warning signs.</p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex flex-col">
                <span className="text-accent font-semibold mb-2 text-sm uppercase tracking-wider">Awareness</span>
                <p className="text-foreground text-lg font-medium">Information for informed choices.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Recent experiences */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <Reveal>
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Recent experiences</h2>
              <p className="text-secondary text-lg">Stories shared anonymously.</p>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recentReports.map((report, i) => (
              <Reveal key={report.id} delay={i * 100} className="h-full">
                <Link href={`/reports/${report.id}`} className="block h-full card-hover">
                  <div className="bg-surface border border-soft-border rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-accent tracking-wider">{report.incidentTypes[0]}</span>
                      <span className="text-xs text-secondary">{report.year}</span>
                    </div>
                    <div className="text-sm text-secondary mb-4">
                      {report.context} &middot; {report.city}
                    </div>
                    <p className="text-foreground leading-relaxed mb-6 flex-1 italic text-base">
                      &quot;{report.excerpt}&quot;
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                      {report.behaviors.slice(0, 2).map((b: string) => (
                        <span key={b} className="text-xs bg-accent-secondary/30 border border-accent-secondary/40 px-2.5 py-1 rounded-md text-foreground font-medium">
                          {b}
                        </span>
                      ))}
                      {report.behaviors.length > 2 && (
                        <span className="text-xs text-secondary px-2 py-1">+{report.behaviors.length - 2}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center border-t border-soft-border pt-4 mt-auto">
                      <span className="text-sm font-medium text-secondary">{report.pseudonym}</span>
                      <span className="text-sm text-secondary">{report.commentCount} comments</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          
          <Reveal delay={300}>
            <div className="mt-12 text-center md:text-left">
              <Link href="/reports" className="text-accent font-medium hover:text-accent-secondary transition-colors inline-flex items-center gap-2 group">
                View all experiences 
                <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recognize the signs */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Recognize the signs.</h2>
            <p className="text-xl text-secondary mb-12">Small patterns can matter.</p>
          </Reveal>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Controlling communication", "Extreme jealousy", "Threats",
              "Physical intimidation", "Isolation", "Blocking an exit",
              "Unwanted contact", "Gaslighting"
            ].map((sign, i) => (
              <Reveal key={sign} delay={i * 50} className="inline-block">
                <span className="bg-accent-secondary/30 border border-accent-secondary/40 px-5 py-2.5 rounded-full text-sm font-medium text-foreground hover:-translate-y-0.5 transition-transform cursor-default">
                  {sign}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Your story. Your choice.</h2>
                <p className="text-xl text-secondary mb-8">
                  No account. No names. Just your experience.
                </p>
                <Link href="/about" className="text-accent font-medium hover:text-accent-secondary transition-colors inline-flex items-center gap-2 group">
                  Learn about privacy
                  <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="bg-surface border border-soft-border rounded-3xl p-8 shadow-sm">
                <ul className="space-y-6">
                  {[
                    "No names",
                    "No exact locations",
                    "No contact information",
                    "Reviewed before publication"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-foreground font-medium">
                      <div className="w-6 h-6 rounded-full bg-accent-secondary/30 text-accent flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-surface text-center px-4">
        <div className="container mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Have an experience to share?</h2>
            <p className="text-xl text-secondary mb-10">Share it anonymously.</p>
            <Link 
              href="/submit" 
              className="inline-block px-10 py-4 bg-accent text-surface rounded-full font-medium btn-interaction shadow-sm text-lg"
            >
              Share anonymously
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
