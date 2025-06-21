import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Mail, X } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl border-orange-200">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
            <X className="h-10 w-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Subscription Cancelled
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600">
            No worries! Your subscription has been cancelled and no payment was processed.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              <strong>What happened?</strong> You cancelled the payment process. No charges were made to your account.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              Still interested in our newsletter?
            </h3>
            
            <div className="space-y-3">
              <p className="text-gray-600">
                Join thousands of digital nomads who receive our weekly premium content for just €2/month:
              </p>
              
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Weekly nomad hacks and practical tips
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Coliving events and networking opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Featured nomad stories and inspiration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Curated YouTube content for nomads
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Monthly budget planning guides
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">💡 Why subscribe?</h4>
            <p className="text-sm text-amber-700">
              Get exclusive access to premium nomad content, early access to new coliving spaces, 
              and connect with a global community of digital nomads.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              <Link href="/#newsletter">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Homepage
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions? Email us at{' '}
              <a href="mailto:volkanoluc@nomadshood.com" className="text-orange-600 hover:underline">
                volkanoluc@nomadshood.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 