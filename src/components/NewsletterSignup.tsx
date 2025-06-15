'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { functions } from '@/lib/firebase';
import type { NewsletterFormData } from '@/types';
import { httpsCallable } from 'firebase/functions';
import { AlertCircle, Download, FileText, Shield } from 'lucide-react';
import React, { useState } from 'react';

const AVAILABLE_COUNTRIES = [
  'Spain', 'Portugal', 'Mexico', 'Costa Rica', 'Colombia', 'Thailand', 
  'Indonesia', 'Brazil', 'United States', 'Germany', 'France', 'Italy',
  'Netherlands', 'Estonia', 'Poland', 'Czech Republic', 'Greece'
];

// Initialize the callable function
const createNewsletterCheckout = httpsCallable(functions, 'createNewsletterCheckout');

export function NewsletterSignup() {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    countries: [],
    language: 'en' // Default to English
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrorMessage('Please enter your email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Create Stripe checkout session
      const result = await createNewsletterCheckout({
        email: formData.email,
        countries: formData.countries.length > 0 ? formData.countries : ['General'], // Default if no country selected
        language: formData.language
      });

      const { checkoutUrl } = result.data as { checkoutUrl: string; sessionId: string };
      
      // Show success message briefly before redirect
      setSubmitStatus('success');
      
      // Redirect to Stripe checkout after brief delay
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-orange-200 shadow-2xl bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <FileText className="h-8 w-8" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                FREE
              </div>
            </div>
            <h2 className="text-xl font-bold">Get Your FREE Nomad Starter Guide</h2>
          </div>
          <p className="text-orange-100 text-sm">Plus weekly newsletter with premium content</p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* PDF Benefits - Above Form */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="font-bold text-gray-900 mb-3 text-center">🎁 What's Inside Your Bonus PDF:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🎒</span>
                <span>Packing checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>Budget planner</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💪</span>
                <span>Fitness guide</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>Visa tips</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>Remote work advice</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>Weekly nomad tips</span>
              </div>
            </div>
          </div>

          {/* Simplified Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email - Required */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            {/* Country - Optional Dropdown */}
            <div>
              <Label className="text-sm font-medium">
                Country of Interest (Optional)
              </Label>
              <Select 
                value={formData.countries[0] || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  countries: value ? [value] : [] 
                }))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select your target country" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <Download className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Thanks! Redirecting to secure payment...
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* CTA Button - Shorter and More Urgent */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  🔓 Access the Guide for €2/month
                </>
              )}
            </Button>

            {/* Trust Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full border">
                <Shield className="h-4 w-4 text-green-600" />
                <span>✅ Secure payment via Stripe. Cancel anytime.</span>
              </div>
            </div>

            {/* Additional Benefits */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>📩 Instant PDF download after payment</p>
              <p>🌟 Join 2,847+ nomads already using our guides</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 