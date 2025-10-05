'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  MapPin,
  FileText,
  Users,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SpainGuideTeaser() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-orange-300 shadow-2xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden hover:shadow-3xl transition-all duration-300">
        {/* Header with Badge */}
        <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 text-center">
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-500 text-white font-bold text-xs px-3 py-1">
              LIMITED TIME
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <FileText className="h-10 w-10" />
              <div className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                NEW
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Spain Digital Nomad Guide</h2>
          </div>
          <p className="text-orange-100 text-lg">Stop wasting time researching. Get everything in ONE place.</p>
        </div>

        <CardContent className="p-6">
          {/* Problem Statement */}
          <div className="bg-white rounded-lg p-4 mb-6 border-l-4 border-orange-500">
            <p className="text-gray-800 text-lg font-medium">
              Most nomads waste <span className="text-orange-600 font-bold">6+ months</span> and{' '}
              <span className="text-orange-600 font-bold">€2000+</span> figuring out Spain.{' '}
              <span className="text-orange-600 font-bold">Skip the struggle.</span>
            </p>
          </div>

          {/* Quick Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-white rounded-lg">
              <MapPin className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">50+ Colivings</p>
              <p className="text-xs text-gray-600">Curated List</p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">Visa Guide</p>
              <p className="text-xs text-gray-600">Step-by-Step</p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <Smartphone className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">30+ Apps</p>
              <p className="text-xs text-gray-600">Must-Have</p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">15+ Groups</p>
              <p className="text-xs text-gray-600">WhatsApp Links</p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Complete visa resources & document checklist</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">50+ Barcelona, Madrid & Valencia colivings with prices</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Direct WhatsApp community invite links</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Budget calculators & packing checklists included</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => router.push('/spain-guide')}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="mr-2 h-5 w-5" />
            Get the Complete Guide
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Trust Elements */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>30-day refund</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>2,847+ nomads</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>Instant access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
