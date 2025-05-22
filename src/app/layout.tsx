import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans to Inter
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ // Changed to Inter
  variable: '--font-inter', // Updated CSS variable name
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
    <html lang="en" className={inter.variable}> {/* Apply the new font variable */}
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
