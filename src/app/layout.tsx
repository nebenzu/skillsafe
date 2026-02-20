import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://skillsafe.dev'),
  title: 'SkillSafe - ClawHub Skill Trust Scanner',
  description: 'Know what you\'re installing before it\'s too late. Scan OpenClaw skills for security risks.',
  openGraph: {
    title: 'SkillSafe - Scan Before You Install',
    description: '230+ malicious skills uploaded to ClawHub last week. Get instant trust reports before installing.',
    type: 'website',
    url: 'https://skillsafe.dev',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skillsafe_',
    creator: '@skillsafe_',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
