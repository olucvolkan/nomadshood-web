import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'NomadsHood - Discover Coliving Spaces & Digital Nomad Communities',
    template: '%s | NomadsHood'
  },
  description: 'Discover amazing coliving spaces and connect with digital nomad communities worldwide. Find your perfect home away from home with NomadsHood.',
  keywords: ['coliving', 'digital nomad', 'coworking', 'remote work', 'nomad community', 'travel', 'accommodation'],
  authors: [{ name: 'NomadsHood Team' }],
  creator: 'NomadsHood',
  publisher: 'NomadsHood',
  metadataBase: new URL('https://nomadshood.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nomadshood.com',
    title: 'NomadsHood - Discover Coliving Spaces & Digital Nomad Communities',
    description: 'Discover amazing coliving spaces and connect with digital nomad communities worldwide. Find your perfect home away from home with NomadsHood.',
    siteName: 'NomadsHood',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NomadsHood - Coliving Directory and Digital Nomad Community'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadsHood - Discover Coliving Spaces & Digital Nomad Communities',
    description: 'Discover amazing coliving spaces and connect with digital nomad communities worldwide. Find your perfect home away from home with NomadsHood.',
    images: ['/og-image.jpg'],
    creator: '@nomadshood'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code-here'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
