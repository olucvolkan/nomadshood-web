import type { Metadata } from 'next';
import { SpainGuideContent } from '@/components/SpainGuideContent';

export const metadata: Metadata = {
  title: 'Spain Digital Nomad Guide - Your Complete Resource for Living in Spain',
  description: 'Stop wasting time researching Spain! Get the complete digital nomad guide with 50+ colivings, visa resources, essential apps, WhatsApp communities, and more. Everything in one place for €19.',
  openGraph: {
    title: 'Spain Digital Nomad Guide - Your Complete Resource',
    description: 'Everything you need to know about living as a digital nomad in Spain - colivings, visas, communities, and more.',
    images: ['/og-spain-guide.jpg'],
  },
  twitter: {
    title: 'Spain Digital Nomad Guide - Your Complete Resource',
    description: 'Everything you need to know about living as a digital nomad in Spain - colivings, visas, communities, and more.',
  },
  alternates: {
    canonical: '/spain-guide'
  }
};

export default function SpainGuidePage() {
  return <SpainGuideContent />;
}
