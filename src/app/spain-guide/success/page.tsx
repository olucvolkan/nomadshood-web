import type { Metadata } from 'next';
import { SpainGuideSuccessContent } from '@/components/SpainGuideSuccessContent';

export const metadata: Metadata = {
  title: 'Purchase Successful - Spain Digital Nomad Guide',
  description: 'Thank you for your purchase! Access your Spain Digital Nomad Guide now.',
  robots: 'noindex,nofollow'
};

export default function SpainGuideSuccessPage() {
  return <SpainGuideSuccessContent />;
}
