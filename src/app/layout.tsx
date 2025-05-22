import type { Metadata } from 'next';
import { Geist_Sans } from 'next/font/google'; // Corrected import for Geist Sans
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist_Sans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono is available but not explicitly used in primary text, keeping for potential future use (e.g. code blocks)
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Nomad Coliving Hub',
  description: 'Discover coliving spaces and connect with digital nomad communities worldwide.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
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
