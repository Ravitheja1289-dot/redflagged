import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Our Mission & Methodology",
  description:
    "Learn about RedFlaggers: an anonymous, community-driven platform for recognizing behavioral warning signs, toxic patterns, and relationship red flags.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About RedFlaggers — Mission & Methodology",
    description:
      "An educational resource built from anonymous experiences to help people recognize warning signs and patterns.",
    url: "https://redflaggers.vercel.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">About RedFlaggers</h1>
      
      <div className="prose prose-neutral max-w-none prose-lg text-secondary">
        <p className="text-xl leading-relaxed text-foreground font-medium mb-8">
          RedFlaggers is an anonymous crowdsourced platform for documenting experiences of unsafe behavior. Our goal is to help people recognize recurring warning signs and patterns from real, anonymous experiences.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">Why it exists</h2>
        <p>
          Abuse rarely starts with violence. It often begins with subtle boundary violations, isolation tactics, and controlling behavior. By sharing these experiences, we can build a collective understanding of what these warning signs look like in practice, helping others recognize them earlier.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">What RedFlaggers is</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>An educational resource based on real experiences.</li>
          <li>A safe, anonymous space to share stories without requiring an account.</li>
          <li>A platform focused on patterns, behaviors, and awareness.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">What RedFlaggers is not</h2>
        <ul className="list-disc pl-6 space-y-3 mb-8">
          <li><strong>Not a public accusation platform:</strong> We do not publish names or identifying information of any individuals.</li>
          <li><strong>Not a crime database:</strong> We do not independently verify or investigate these experiences. A report represents an experience submitted by a user. RedFlaggers does not independently establish whether an allegation is true.</li>
          <li><strong>Not an emergency service:</strong> If you are in immediate danger, please contact local emergency services.</li>
        </ul>

        <div className="bg-surface border border-soft-border p-8 rounded-2xl mt-12 text-center">
          <h3 className="text-xl font-bold text-foreground mb-4">Help build awareness</h3>
          <p className="mb-6">Your experience could help someone else recognize a dangerous pattern.</p>
          <Link href="/submit" className="inline-block px-6 py-2.5 bg-foreground text-surface rounded-full text-xs font-semibold hover:bg-white active:scale-95 transition-all duration-100 shadow-md cursor-pointer">
            Share anonymously
          </Link>
        </div>
      </div>
    </div>
  );
}
