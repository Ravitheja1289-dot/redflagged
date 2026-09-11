import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Anonymously',
  description:
    'Submit an anonymous experience to help others recognize red flags and warning patterns. No names, no registration, completely confidential.',
  alternates: {
    canonical: '/submit',
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
