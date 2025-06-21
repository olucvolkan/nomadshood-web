import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Home, Mail, Video } from 'lucide-react';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: {
    session_id?: string;
  };
}

export default function NewsletterSuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl border-green-200">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to NomadsHood Newsletter! 🎉
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600">
            Your subscription is now active. Thank you for joining our community!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                <strong>Payment successful!</strong> Your subscription ID: 
                <span className="font-mono ml-1">{sessionId.slice(-8)}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              What happens next?
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Email Confirmation</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a welcome email within the next few minutes with your first newsletter.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Weekly Content</h4>
                  <p className="text-sm text-gray-600">
                    Every week, you'll receive curated content including nomad hacks, coliving events, and featured stories.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Exclusive Access</h4>
                  <p className="text-sm text-gray-600">
                    Get early access to new coliving listings, special events, and premium travel guides.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-amber-700">
              Add <strong>newsletter@nomadshood.com</strong> to your contacts to ensure our emails don't end up in spam!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Homepage
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
              <Link href="/coliving">
                <Video className="mr-2 h-4 w-4" />
                Explore Colivings
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions? Email us at{' '}
              <a href="mailto:volkanoluc@nomadshood.com" className="text-green-600 hover:underline">
                volkanoluc@nomadshood.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 