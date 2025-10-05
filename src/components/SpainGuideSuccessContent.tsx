'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, FileText, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SpainGuideSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-green-300 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              🎉 Payment Successful!
            </CardTitle>
            <p className="text-green-100 text-lg">
              Welcome to the Spain Digital Nomad community!
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Your Spain Guide is Ready!
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We've sent your complete Spain Digital Nomad Guide to your email.
                Check your inbox (and spam folder) for instant access.
              </p>
            </div>

            {/* Session Info */}
            {sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-mono text-xs">{sessionId}</span>
                </p>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-500" />
                What's Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-700">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Check Your Email</p>
                    <p className="text-sm text-gray-600">Your guide with download link is waiting in your inbox</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-700">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Download Your Guide</p>
                    <p className="text-sm text-gray-600">Click the download link to access all 7 chapters + bonuses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-700">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Join WhatsApp Communities</p>
                    <p className="text-sm text-gray-600">Use the direct invite links in Chapter 7 to connect with nomads</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-700">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Start Planning!</p>
                    <p className="text-sm text-gray-600">Use the budget calculators and checklists to plan your move</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Didn't receive the email?</p>
                  <p className="text-sm text-gray-600">
                    Check your spam folder or contact us at{' '}
                    <a href="mailto:volkanoluc@nomadshood.com" className="text-blue-600 hover:underline font-medium">
                      volkanoluc@nomadshood.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 text-lg"
              >
                <Link href="/">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Explore More Colivings
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 py-4"
              >
                <a href="mailto:volkanoluc@nomadshood.com?subject=Spain Guide Support">
                  <Mail className="mr-2 h-5 w-5" />
                  Need Help? Contact Us
                </a>
              </Button>
            </div>

            {/* Trust Message */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                🎯 You're now part of <span className="font-semibold text-orange-600">2,847+ digital nomads</span> using our guides!
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Questions? We're here to help - just reply to the email or contact us directly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-redirect info */}
        {countdown > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Redirecting to homepage in {countdown} seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
