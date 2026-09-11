export function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RedFlaggers",
    url: "https://redflaggers.vercel.app",
    description:
      "An anonymous platform for sharing experiences and recognizing patterns of harassment, abuse, stalking, toxic relationships, and workplace misconduct.",
    inLanguage: "en-US",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RedFlaggers",
    url: "https://redflaggers.vercel.app",
    logo: "https://redflaggers.vercel.app/opengraph-image",
    description:
      "A platform for crowdsourced, anonymous experiences helping people recognize behavioral warning signs and patterns.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
