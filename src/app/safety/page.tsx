import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Emergency Resources",
  description:
    "Safety guidelines, emergency resources, and quick exit tools for visitors and individuals navigating unsafe situations.",
  alternates: {
    canonical: "/safety",
  },
  openGraph: {
    title: "Safety & Emergency Resources | RedFlaggers",
    description:
      "Safety guidelines, emergency resources, and quick exit tools for visitors and individuals navigating unsafe situations.",
    url: "https://redflaggers.vercel.app/safety",
  },
};

export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-accent-secondary/20 border border-accent-secondary/30 rounded-2xl p-8 mb-12">
        <h1 className="text-3xl font-bold text-accent mb-4">Emergency Support</h1>
        <p className="text-foreground text-lg mb-6">
          RedFlaggers is not an emergency response service. If you are in immediate danger, please contact authorities immediately.
        </p>
        <div className="bg-surface border border-accent-secondary/30 rounded-xl p-6">
          <p className="text-sm text-secondary font-medium uppercase tracking-wider mb-2">Notice</p>
          <p className="text-foreground">
            Emergency hotline numbers and support resources will be populated in Phase 2 of this platform.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Exit</h2>
          <p className="text-secondary mb-6 leading-relaxed">
            If you are concerned that someone may be monitoring your device or if you need to quickly leave this site, you can use the Quick Exit button. It will immediately redirect you to a neutral website.
          </p>
          <div className="bg-surface border border-soft-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground mb-1">Test Quick Exit</h3>
              <p className="text-sm text-secondary">Clicking this will redirect you to Google.</p>
            </div>
            <a 
              href="https://google.com" 
              className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-foreground rounded-full font-medium transition-colors"
            >
              Quick Exit
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Digital Security</h2>
          <div className="prose prose-neutral max-w-none text-secondary">
            <p>
              When dealing with controlling behavior, your digital security is important. Please keep in mind:
            </p>
            <ul className="space-y-2">
              <li>Browsing history can be checked. Consider using a private browsing window or clearing your history.</li>
              <li>RedFlaggers does not require an account, so there is no login information to compromise.</li>
              <li>We recommend avoiding submitting reports while connected to a shared home Wi-Fi if you suspect network monitoring.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
