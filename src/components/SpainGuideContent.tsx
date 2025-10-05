'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Smartphone,
  FileText,
  Users,
  Backpack,
  Youtube,
  Clock,
  Euro,
  AlertCircle,
  Download,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Initialize the callable function
const buySpainGuide = httpsCallable(functions, 'buySpainGuide');

export function SpainGuideContent() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage('Please enter your email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      console.log('Calling buySpainGuide with email:', email);

      // Create Stripe checkout session
      const result = await buySpainGuide({ email });

      console.log('Received result:', result);

      const { checkoutUrl } = result.data as { checkoutUrl: string; sessionId: string };

      if (!checkoutUrl) {
        throw new Error('No checkout URL received');
      }

      // Show success message briefly before redirect
      setSubmitStatus('success');

      // Redirect to Stripe checkout after brief delay
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session. Please try again.');
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section - Problem-Solution Framework */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Stuck Planning Your Spanish Digital Nomad Life?
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-8">
              Most nomads waste <span className="text-orange-600 font-bold">6+ months</span> and{' '}
              <span className="text-orange-600 font-bold">€2000+</span> figuring out Spain.{' '}
              <span className="text-orange-600 font-bold">Skip the struggle.</span>
            </p>

            {/* Visual Counter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <Clock className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">180+ hours</p>
                <p className="text-gray-600">Average Time Wasted</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <Euro className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">€2,000+</p>
                <p className="text-gray-600">Average Money Lost</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">30%</p>
                <p className="text-gray-600">Visa Rejection Rate</p>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium text-gray-800 block mb-2">
                  Enter your email to get instant access:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-lg py-6 px-4"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <Download className="h-4 w-4 text-green-600" />
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

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl text-2xl py-8 px-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Get The Complete Guide Now - €10
                    <Download className="ml-3 h-6 w-6" />
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                🔒 Secure payment via Stripe • 30-day money-back guarantee
              </p>
            </form>
          </div>

          {/* Pain Points */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                <XCircle className="mr-3 h-6 w-6" />
                Without This Guide
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Endless Google searches with contradictory info
                </li>
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Missing out on best colivings (they book fast!)
                </li>
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Visa rejections due to incomplete knowledge
                </li>
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Feeling isolated without community connections
                </li>
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Using wrong apps = wasting money
                </li>
                <li className="flex items-start text-gray-700">
                  <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  Packing mistakes = unnecessary expenses
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                <CheckCircle2 className="mr-3 h-6 w-6" />
                With This Guide
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Start smart from day 1
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Save thousands on mistakes
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Book best colivings early
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Visa confidence with step-by-step guide
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Instant community access
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Local insider knowledge
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section - Clean Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in ONE Place
            </h2>
            <p className="text-2xl text-gray-600 font-medium">
              "Everything you'd discover in 6 months... in 2 hours."
            </p>
          </div>

          {/* Clean Grid with Icons */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">50+ Curated Colivings</p>
              <p className="text-sm text-gray-600 mt-1">Prices, Reviews, Booking Links</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Official Visa Resources</p>
              <p className="text-sm text-gray-600 mt-1">Complete Resource Library</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">30+ Must-Have Apps</p>
              <p className="text-sm text-gray-600 mt-1">Banking, Transport, Food</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">15+ WhatsApp Communities</p>
              <p className="text-sm text-gray-600 mt-1">Active Groups with Direct Links</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Complete Packing List</p>
              <p className="text-sm text-gray-600 mt-1">Optimized for Spain Climate</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">YouTube Goldmine</p>
              <p className="text-sm text-gray-600 mt-1">Digital Nomad Channels</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Monthly Cost Breakdown</p>
              <p className="text-sm text-gray-600 mt-1">Budget Planning Tools</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Legal & Tax Basics</p>
              <p className="text-sm text-gray-600 mt-1">Autónomo & Freelance Guide</p>
            </div>
          </div>

          {/* Detailed Chapter Breakdown */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Complete Chapter Breakdown</h3>

            <div className="space-y-6">
              {/* Chapter 1 */}
              <Card className="border-l-4 border-l-orange-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Backpack className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">🎒 Chapter 1: The Perfect Nomad Backpack</CardTitle>
                      <CardDescription className="text-base">
                        <ul className="grid md:grid-cols-2 gap-2 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Essential packing checklist</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tech gear recommendations</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Minimalist living strategies</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Spain climate considerations</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Weight optimization tricks</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Budget vs Premium gear guide</li>
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 2 */}
              <Card className="border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">🏠 Chapter 2: Spain's Best Colivings (2025)</CardTitle>
                      <CardDescription className="text-base">
                        <ul className="space-y-2 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Barcelona Colivings (5-7 options with prices, amenities, WiFi speeds)</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Madrid Colivings (5-7 options with community vibe ratings)</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Valencia Colivings (4-5 options with booking links)</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Smaller Cities: Malaga, Seville, Granada</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Complete comparison matrix</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className="font-semibold">Insider Tips: How to negotiate monthly rates</span></li>
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 3 */}
              <Card className="border-l-4 border-l-purple-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Smartphone className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">📱 Chapter 3: Essential Spain Apps</CardTitle>
                      <CardDescription className="text-base">
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Banking & Money</p>
                            <ul className="space-y-1 text-sm">
                              <li>• N26, Revolut, Wise</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Transportation</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Renfe, Cabify, Bla Bla Car</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Food & Delivery</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Glovo, Just Eat</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Language & Networking</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Duolingo, Tandem, Meetup</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Housing</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Idealista, Fotocasa</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Healthcare</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Sanitas, DKV apps</li>
                            </ul>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 4 */}
              <Card className="border-l-4 border-l-green-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">🛂 Chapter 4: Visa Mastery Guide</CardTitle>
                      <CardDescription className="text-base">
                        <ul className="grid md:grid-cols-2 gap-2 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Digital Nomad Visa (detailed walkthrough)</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Non-Lucrative Visa resources</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Student Visa options</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Freelance/Autónomo registration</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Official government links</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Complete document checklist</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Timeline expectations</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Common rejection reasons (avoid costly mistakes!)</li>
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 5 */}
              <Card className="border-l-4 border-l-yellow-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">💡 Chapter 5: Digital Nomad Hacks</CardTitle>
                      <CardDescription className="text-base">
                        <ul className="grid md:grid-cols-2 gap-2 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cost of living breakdown by city</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Best coworking spaces</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Networking strategies</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tax optimization basics</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Healthcare navigation</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Spanish bureaucracy survival</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cultural integration tips</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Safety & scams to avoid</li>
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 6 */}
              <Card className="border-l-4 border-l-red-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <Youtube className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">🎥 Chapter 6: Content Creator Resources</CardTitle>
                      <CardDescription className="text-base">
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Top YouTube Channels</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Spain visa guides</li>
                              <li>• Cost of living vlogs</li>
                              <li>• Digital nomad lifestyle</li>
                              <li>• Spanish language learning</li>
                              <li>• Cultural immersion</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Other Platforms</p>
                            <ul className="space-y-1 text-sm">
                              <li>• Podcasts</li>
                              <li>• Instagram Accounts</li>
                              <li>• TikTok Creators</li>
                            </ul>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chapter 7 */}
              <Card className="border-l-4 border-l-indigo-500 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">👥 Chapter 7: Community Gold Mine</CardTitle>
                      <CardDescription className="text-base">
                        <div className="space-y-3 mt-2">
                          <div>
                            <p className="font-semibold text-gray-700 mb-2">WhatsApp Groups (Direct Links)</p>
                            <ul className="grid md:grid-cols-2 gap-2">
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Barcelona Digital Nomads</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Madrid Expat Community</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Valencia Remote Workers</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Spain Visa Help Group</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Spanish Language Exchange</li>
                              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Freelancer Network Spain</li>
                            </ul>
                          </div>
                          <p className="text-sm text-gray-600">+ Telegram Channels, Facebook Groups, Discord Servers, Local Meetup Events</p>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Bonus */}
              <Card className="border-l-4 border-l-pink-500 hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-50 to-rose-50">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-pink-100 p-3 rounded-lg">
                      <Download className="h-8 w-8 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">📊 Bonus: Interactive Resources</CardTitle>
                      <CardDescription className="text-base">
                        <ul className="grid md:grid-cols-2 gap-2 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Budget calculator spreadsheet</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Packing checklist PDF</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Visa application tracker</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cost comparison tool</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Coliving booking calendar</li>
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-blue-500 text-white text-lg px-6 py-2 mb-4">
              2,847+ Nomads Already Using
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-12">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-orange-700">S</span>
                  </div>
                  <div>
                    <p className="font-bold">Sarah</p>
                    <p className="text-sm text-gray-500">Digital Marketer, Berlin</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "This guide saved me 3 months of research! Everything I needed in one place."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-700">M</span>
                  </div>
                  <div>
                    <p className="font-bold">Marcus</p>
                    <p className="text-sm text-gray-500">Software Developer</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "The WhatsApp groups alone are worth 10x the price. Instant community!"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-green-700">A</span>
                  </div>
                  <div>
                    <p className="font-bold">Ana</p>
                    <p className="text-sm text-gray-500">Freelance Designer</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">
                  "Got my visa approved using these resources. The checklist was a lifesaver!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Is this information up-to-date?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Updated monthly + free updates for 12 months
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can I really access the WhatsApp groups?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Yes! Direct invite links included for instant access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What if I don't like it?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 flex items-start">
                  <Shield className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  30-day full refund, no questions asked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Is €10 a one-time payment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Yes! No subscriptions, yours forever
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Start Your Spain Adventure?
          </h2>
          <p className="text-2xl mb-8 opacity-90">
            Join 2,847+ digital nomads who are already living their best life in Spain
          </p>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <p className="text-3xl font-bold mb-2">Limited Time Offer</p>
            <p className="text-6xl font-bold mb-4">€10</p>
            <p className="text-xl opacity-90">One-time payment • Lifetime access • Free updates for 12 months</p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/90 text-gray-800 text-lg py-6 px-4"
                disabled={isSubmitting}
              />
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <Download className="h-4 w-4 text-green-600" />
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

            <Button
              type="submit"
              size="lg"
              className="w-full bg-white text-orange-600 hover:bg-gray-100 shadow-2xl text-2xl py-8 px-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  Get Instant Access Now
                  <Download className="ml-3 h-6 w-6" />
                </>
              )}
            </Button>

            <p className="text-sm opacity-75 text-center">
              🔒 Secure payment • 30-day money-back guarantee
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
