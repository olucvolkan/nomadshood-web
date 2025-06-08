'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { functions } from '@/lib/firebase';
import type { NewsletterFormData } from '@/types';
import { httpsCallable } from 'firebase/functions';
import { AlertCircle, Check, CreditCard, Mail } from 'lucide-react';
import React, { useState } from 'react';

const AVAILABLE_COUNTRIES = [
  'Spain', 'Portugal', 'Mexico', 'Costa Rica', 'Colombia', 'Thailand', 
  'Indonesia', 'Brazil', 'United States', 'Germany', 'France', 'Italy',
  'Netherlands', 'Estonia', 'Poland', 'Czech Republic', 'Greece'
];

const NEWSLETTER_FEATURES = [
  {
    icon: '📈',
    title: 'Weekly Nomad Hack',
    description: 'Practical tips and tools for digital nomads'
  },
  {
    icon: '🎉',
    title: 'Coliving Events This Week',
    description: 'Community events and networking opportunities'
  },
  {
    icon: '✨',
    title: 'Featured Nomad Story',
    description: 'Inspiring stories and quotes from nomads'
  },
  {
    icon: '🎥',
    title: 'Inspired YouTube Videos',
    description: 'Curated content for nomadic lifestyle'
  },
  {
    icon: '💰',
    title: 'Monthly Budget Plans',
    description: 'Cost-effective planning for your travels'
  }
];

// Initialize the callable function
const createNewsletterCheckout = httpsCallable(functions, 'createNewsletterCheckout');

export function NewsletterSignup() {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    countries: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      countries: checked 
        ? [...prev.countries, country]
        : prev.countries.filter(c => c !== country)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || formData.countries.length === 0) {
      setErrorMessage('Please fill in all required fields');
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
        countries: formData.countries
      });

      const { checkoutUrl } = result.data as { checkoutUrl: string; sessionId: string };
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Newsletter Features */}
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">What You'll Get</h3>
            <p className="text-gray-600">
              Join our exclusive newsletter for €2/month and get premium nomad content delivered to your inbox.
            </p>
          </div>

          <div className="space-y-4">
            {NEWSLETTER_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Secure Payment</span>
            </div>
            <p className="text-sm text-amber-700">
              Payment is processed securely through Stripe. You can cancel your subscription at any time.
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-orange-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              Join NomadsHood Newsletter
            </CardTitle>
            <CardDescription>
              Fill in your details and proceed to secure payment
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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

              {/* Countries */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Countries of Interest * (Select at least one)
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {AVAILABLE_COUNTRIES.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={country}
                        checked={formData.countries.includes(country)}
                        onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
                      />
                      <Label 
                        htmlFor={country} 
                        className="text-sm cursor-pointer"
                      >
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.countries.length} countries
                </p>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Redirecting to secure payment...
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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe for €2/month
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Secure payment powered by Stripe</p>
                <p>By subscribing, you agree to receive our weekly newsletter. You can unsubscribe at any time.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 