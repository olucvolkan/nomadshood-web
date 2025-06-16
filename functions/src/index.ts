import axios from 'axios';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { onSubscriberCreate } from './subscriberTrigger';
import { generateTestPdf } from './testPdfEndpoint';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Stripe with secret key from config
const getStripe = () => {
  const stripeSecretKey = functions.config().stripe?.secret_key;
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not found in Firebase config');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
  });
};

// Initialize Resend
const getResend = () => {
  const resendApiKey = functions.config().resend?.api_key;
  if (!resendApiKey) {
    throw new Error('Resend API key not found in Firebase config');
  }
  return new Resend(resendApiKey);
};

interface MailSubscriber {
  email: string;
  countries: string[];
  language?: string;
  createdAt: FirebaseFirestore.Timestamp;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  active?: boolean;
}

interface MailerLiteSubscriber {
  email: string;
  fields?: {
    countries?: string;
    language?: string;
    created_at?: string;
    payment_status?: string;
    source?: string;
  };
  groups?: string[];
  status?: 'active' | 'unsubscribed' | 'unconfirmed';
}

/**
 * Create Stripe checkout session for newsletter subscription
 */
export const createNewsletterCheckout = functions.https.onCall(async (data, context) => {
  try {
    const { email, countries, language } = data;
    
    if (!email || !countries || !Array.isArray(countries) || countries.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and countries are required');
    }

    // Default to English if no language specified
    const selectedLanguage = language || 'en';

    const stripe = getStripe();

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update customer metadata with new preferences
      await stripe.customers.update(customer.id, {
        metadata: {
          countries: countries.join(', '),
          language: selectedLanguage,
          source: 'nomadshood_newsletter'
        }
      });
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          countries: countries.join(', '),
          language: selectedLanguage,
          source: 'nomadshood_newsletter'
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'NomadsHood Newsletter Subscription',
              description: 'Monthly premium nomad content and personalized PDF guides',
              images: ['https://nomadshood.com/newsletter-preview.jpg'], // Add your image
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 200, // €2.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${functions.config().app?.url || 'https://nomadshood.com'}/newsletter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().app?.url || 'https://nomadshood.com'}/newsletter/cancel`,
      metadata: {
        email: email,
        countries: countries.join(', '),
        language: selectedLanguage,
        source: 'nomadshood_newsletter'
      }
    });

    // Store pending subscription in Firestore
    const pendingSubscription = {
      email: email,
      countries: countries,
      language: selectedLanguage,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentStatus: 'pending' as const,
      stripeSessionId: session.id,
      stripeCustomerId: customer.id,
      active: false
    };

    await admin.firestore()
      .collection('mail_subscriber_pending')
      .doc(session.id)
      .set(pendingSubscription);

    return {
      sessionId: session.id,
      checkoutUrl: session.url
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

/**
 * Handle Stripe webhook events
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = functions.config().stripe?.webhook_secret;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(400).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    const signature = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  try {
    // Get pending subscription
    const pendingDoc = await admin.firestore()
      .collection('mail_subscriber_pending')
      .doc(session.id)
      .get();

    if (!pendingDoc.exists) {
      console.error('Pending subscription not found for session:', session.id);
      return;
    }

    const pendingData = pendingDoc.data();
    
    // Create active subscription
    const activeSubscription: MailSubscriber = {
      email: pendingData!.email,
      countries: pendingData!.countries,
      language: pendingData!.language,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      paymentStatus: 'completed',
      paymentId: session.payment_intent as string,
      stripeSessionId: session.id,
      stripeCustomerId: session.customer as string,
      active: true
    };

    // Add to active subscribers collection
    await admin.firestore()
      .collection('mail_subscriber')
      .add(activeSubscription);

    // Delete pending subscription
    await pendingDoc.ref.delete();

    console.log('Successfully activated subscription for:', pendingData!.email);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for customer:', invoice.customer);
  
  // Update subscription status for this customer
  await admin.firestore()
    .collection('mail_subscriber')
    .where('stripeCustomerId', '==', invoice.customer)
    .get()
    .then(snapshot => {
      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          paymentStatus: 'completed',
          active: true,
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      return batch.commit();
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for customer:', invoice.customer);
  
  // Update subscription status for this customer
  await admin.firestore()
    .collection('mail_subscriber')
    .where('stripeCustomerId', '==', invoice.customer)
    .get()
    .then(snapshot => {
      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          paymentStatus: 'failed',
          active: false,
          lastFailedPaymentDate: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      return batch.commit();
    });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('Subscription canceled for customer:', subscription.customer);
  
  // Deactivate subscription
  await admin.firestore()
    .collection('mail_subscriber')
    .where('stripeCustomerId', '==', subscription.customer)
    .get()
    .then(snapshot => {
      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          active: false,
          canceledAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      return batch.commit();
    });
}

/**
 * Firebase Function that triggers when a new subscriber is added to mail_subscriber collection
 * and automatically adds them to MailerLite
 */
export const syncSubscriberToMailerLite = functions.firestore
  .document('mail_subscriber/{subscriberId}')
  .onCreate(async (snap, context) => {
    try {
      const subscriberData = snap.data() as MailSubscriber;
      const subscriberId = context.params.subscriberId;
      
      console.log(`New subscriber added: ${subscriberId}`, subscriberData);

      // Only sync if payment is completed
      if (subscriberData.paymentStatus !== 'completed') {
        console.log('Skipping sync - payment not completed');
        return;
      }

      // Get MailerLite API key from environment variables
      const mailerLiteApiKey = functions.config().mailerlite?.api_key;
      if (!mailerLiteApiKey) {
        console.error('MailerLite API key not found in Firebase config');
        return;
      }

      // Prepare MailerLite subscriber data
      const mailerLiteData: MailerLiteSubscriber = {
        email: subscriberData.email,
        fields: {
          countries: subscriberData.countries.join(', '),
          language: subscriberData.language || 'en',
          created_at: subscriberData.createdAt.toDate().toISOString(),
          payment_status: subscriberData.paymentStatus || 'pending',
          source: 'nomadshood_website'
        },
        status: 'active' // Set as active since payment completed
      };

      // Add to MailerLite
      const response = await axios.post(
        'https://connect.mailerlite.com/api/subscribers',
        mailerLiteData,
        {
          headers: {
            'Authorization': `Bearer ${mailerLiteApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Successfully added subscriber to MailerLite:', response.data);

      // Update Firestore document with MailerLite subscriber ID
      await snap.ref.update({
        mailerLiteId: response.data.data?.id,
        mailerLiteSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        mailerLiteStatus: 'synced'
      });

      console.log(`Subscriber ${subscriberId} successfully synced to MailerLite`);

    } catch (error) {
      console.error('Error syncing subscriber to MailerLite:', error);

      // Update document with error status
      try {
        await snap.ref.update({
          mailerLiteStatus: 'error',
          mailerLiteError: error instanceof Error ? error.message : 'Unknown error',
          mailerLiteLastAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating document with error status:', updateError);
      }

      // Don't throw the error to prevent Cloud Function retries
      // The error is logged and stored in Firestore for manual review
    }
  });

/**
 * Manual sync function to retry failed syncs or sync existing subscribers
 */
export const retrySyncToMailerLite = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users (you can add more authorization logic here)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subscriberId } = data;
  
  if (!subscriberId) {
    throw new functions.https.HttpsError('invalid-argument', 'subscriberId is required');
  }

  try {
    const doc = await admin.firestore().collection('mail_subscriber').doc(subscriberId).get();
    
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', 'Subscriber not found');
    }

    const subscriberData = doc.data() as MailSubscriber;
    
    // Get MailerLite API key
    const mailerLiteApiKey = functions.config().mailerlite?.api_key;
    if (!mailerLiteApiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'MailerLite API key not configured');
    }

    // Prepare MailerLite subscriber data
    const mailerLiteData: MailerLiteSubscriber = {
      email: subscriberData.email,
      fields: {
        countries: subscriberData.countries.join(', '),
        language: subscriberData.language || 'en',
        created_at: subscriberData.createdAt.toDate().toISOString(),
        payment_status: subscriberData.paymentStatus || 'pending',
        source: 'nomadshood_website_retry'
      },
      status: subscriberData.paymentStatus === 'completed' ? 'active' : 'unconfirmed'
    };

    // Add to MailerLite
    const response = await axios.post(
      'https://connect.mailerlite.com/api/subscribers',
      mailerLiteData,
      {
        headers: {
          'Authorization': `Bearer ${mailerLiteApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Update Firestore document
    await doc.ref.update({
      mailerLiteId: response.data.data?.id,
      mailerLiteSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      mailerLiteStatus: 'synced'
    });

    return { success: true, mailerLiteId: response.data.data?.id };

  } catch (error) {
    console.error('Error in manual sync:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to sync subscriber');
  }
});

/**
 * Function to get sync status of all subscribers
 */
export const getSubscriberSyncStatus = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const snapshot = await admin.firestore().collection('mail_subscriber').get();
    const subscribers = snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      mailerLiteStatus: doc.data().mailerLiteStatus || 'not_synced',
      mailerLiteSyncAt: doc.data().mailerLiteSyncAt,
      mailerLiteError: doc.data().mailerLiteError,
      paymentStatus: doc.data().paymentStatus,
      active: doc.data().active
    }));

    return { subscribers };
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get sync status');
  }
});

/**
 * Send welcome email to new subscribers using Resend API
 */
export const sendWelcomeEmail = functions.firestore
  .document('mail_subscriber/{subscriberId}')
  .onCreate(async (snap, context) => {
    try {
      const subscriberData = snap.data() as MailSubscriber;
      
      console.log(`Sending welcome email to: ${subscriberData.email}`);

      // Only send if payment is completed
      if (subscriberData.paymentStatus !== 'completed') {
        console.log('Skipping welcome email - payment not completed');
        return;
      }

      // Initialize Resend
      const resend = getResend();

      // Generate email content based on selected countries
      const emailContent = await generateWelcomeEmailContent(subscriberData.countries);
      const plainTextContent = await generatePlainTextContent(subscriberData.countries);

      // Send email via Resend API
      const { data, error } = await resend.emails.send({
        from: 'NomadsHood Team <newsletter@nomadshood.com>',
        to: [subscriberData.email],
        subject: '🎉 Welcome to NomadsHood! Your personalized travel guide awaits',
        html: emailContent,
        text: plainTextContent,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      console.log('Welcome email sent successfully:', data);

      // Update subscriber document with welcome email status
      await snap.ref.update({
        welcomeEmailSent: true,
        welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        welcomeEmailStatus: 'sent',
        resendMessageId: data?.id
      });

    } catch (error) {
      console.error('Error sending welcome email:', error);
      
      // Update document with error status
      try {
        await snap.ref.update({
          welcomeEmailStatus: 'error',
          welcomeEmailError: error instanceof Error ? error.message : 'Unknown error',
          welcomeEmailLastAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating document with email error status:', updateError);
      }
    }
  });

async function generateWelcomeEmailContent(countries: string[]): Promise<string> {
  try {
    const emailSections = await Promise.all(
      countries.map(country => fetchCountryDataForEmail(country))
    );

    let colivingsHtml = '';
    let attractionsHtml = '';
    let whatsappHtml = '';

    emailSections.forEach(section => {
      if (section) {
        // Add colivings
        section.colivings.forEach(coliving => {
          colivingsHtml += `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="color: #2c3e50; margin-bottom: 8px;">${coliving.name}</h3>
              <p style="color: #7f8c8d; margin-bottom: 8px;"><strong>📍 ${coliving.city}, ${coliving.country}</strong></p>
              <p style="color: #34495e; margin-bottom: 10px;">€${coliving.monthlyPrice}/month${coliving.hasCoworking ? ' • Co-working space' : ''}${coliving.hasPrivateBathroom ? ' • Private bathroom' : ''}</p>
              ${coliving.website ? `<a href="${coliving.website}" style="color: #e67e22; text-decoration: none; font-weight: bold;">Learn More →</a>` : ''}
            </div>
          `;
        });

        // Add attractions
        section.attractions.forEach(attraction => {
          attractionsHtml += `<li style="margin-bottom: 5px; color: #34495e;">🎯 ${attraction}</li>`;
        });

        // Add WhatsApp groups
        section.whatsappGroups.forEach(group => {
          whatsappHtml += `
            <div style="margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 6px;">
              <h4 style="color: #2c3e50; margin-bottom: 5px;">${group.name}</h4>
              <p style="color: #7f8c8d; margin-bottom: 8px; font-size: 14px;">${group.city ? `${group.city} • ` : ''}${group.memberCount ? `${group.memberCount} members` : 'Active community'}</p>
              <a href="${group.groupLink}" style="color: #25D366; text-decoration: none; font-weight: bold;">💬 Join Group</a>
            </div>
          `;
        });
      }
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NomadsHood!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e67e22; margin-bottom: 10px;">🎉 Welcome to NomadsHood!</h1>
              <p style="color: #7f8c8d; font-size: 18px;">Your personalized nomad guide for ${countries.join(', ')}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 15px;">🏡 Recommended Colivings</h2>
              <p style="color: #7f8c8d; margin-bottom: 20px;">Based on your selected countries, here are some amazing coliving spaces to consider:</p>
              ${colivingsHtml || '<p style="color: #7f8c8d;">We\'re constantly adding new colivings to our database. Check back soon!</p>'}
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 15px;">🌟 Must-Visit Places</h2>
              <p style="color: #7f8c8d; margin-bottom: 15px;">Don't miss these incredible attractions:</p>
              <ul style="list-style: none; padding: 0;">
                  ${attractionsHtml || '<li style="color: #7f8c8d;">Explore the local culture and attractions in your chosen destinations!</li>'}
              </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 15px;">💬 Join the Community</h2>
              <p style="color: #7f8c8d; margin-bottom: 15px;">Connect with fellow nomads in these WhatsApp groups:</p>
              ${whatsappHtml || '<p style="color: #7f8c8d;">We\'re building amazing nomad communities. Stay tuned for group invitations!</p>'}
          </div>

          <div style="background-color: #e67e22; color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="margin-bottom: 15px;">📬 What's Coming Next?</h2>
              <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 8px;">📈 Weekly nomad hacks and tips</li>
                  <li style="margin-bottom: 8px;">🎉 Exclusive coliving events</li>
                  <li style="margin-bottom: 8px;">✨ Featured nomad stories</li>
                  <li style="margin-bottom: 8px;">🎥 Curated YouTube content</li>
                  <li style="margin-bottom: 8px;">💰 Monthly budget planning guides</li>
                  <li style="margin-bottom: 8px;">📄 Personalized PDF travel guides in your preferred language</li>
              </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #7f8c8d;">Questions? Reply to this email or contact us at</p>
              <p><a href="mailto:volkanoluc@gmail.com" style="color: #e67e22; text-decoration: none;">volkanoluc@gmail.com</a></p>
              
              <div style="margin-top: 20px;">
                  <a href="https://nomadshood.com" style="color: #e67e22; text-decoration: none; margin-right: 20px;">🏠 Visit Website</a>
                  <a href="https://youtube.com/@nomadshood" style="color: #e67e22; text-decoration: none;">🎥 YouTube Channel</a>
              </div>
          </div>

      </body>
      </html>
    `;
  } catch (error) {
    console.error('Error generating welcome email content:', error);
    return generateFallbackEmailContent(countries);
  }
}

async function generatePlainTextContent(countries: string[]): Promise<string> {
  try {
    const emailSections = await Promise.all(
      countries.map(country => fetchCountryDataForEmail(country))
    );
    
    let content = `🎉 Welcome to NomadsHood!\n\nYour personalized nomad guide for ${countries.join(', ')}\n\n`;
    
    content += `🏡 RECOMMENDED COLIVINGS\n\n`;
    emailSections.forEach(section => {
      if (section) {
        section.colivings.forEach(coliving => {
          content += `${coliving.name} - ${coliving.city}, ${coliving.country}\n€${coliving.monthlyPrice}/month\n${coliving.website || 'nomadshood.com'}\n\n`;
        });
      }
    });

    content += `🌟 MUST-VISIT PLACES\n\n`;
    emailSections.forEach(section => {
      if (section) {
        section.attractions.forEach(attraction => {
          content += `• ${attraction}\n`;
        });
      }
    });

    content += `\n💬 JOIN THE COMMUNITY\n\n`;
    emailSections.forEach(section => {
      if (section) {
        section.whatsappGroups.forEach(group => {
          content += `${group.name}${group.city ? ` (${group.city})` : ''}\n${group.groupLink}\n\n`;
        });
      }
    });

    content += `📬 WHAT'S COMING NEXT?\n\n`;
    content += `• Weekly nomad hacks and tips\n`;
    content += `• Exclusive coliving events\n`;
    content += `• Featured nomad stories\n`;
    content += `• Curated YouTube content\n`;
    content += `• Monthly budget planning guides\n`;
    content += `• Personalized PDF travel guides in your preferred language\n\n`;

    content += `Questions? Contact us at volkanoluc@gmail.com\n`;
    content += `Visit: https://nomadshood.com\n`;
    content += `YouTube: https://youtube.com/@nomadshood`;

    return content;
  } catch (error) {
    console.error('Error generating plain text content:', error);
    return generateFallbackPlainTextContent(countries);
  }
}

interface CountryEmailData {
  colivings: Array<{
    name: string;
    city: string;
    country: string;
    monthlyPrice: number;
    website?: string;
    hasCoworking: boolean;
    hasPrivateBathroom: boolean;
  }>;
  attractions: string[];
  whatsappGroups: Array<{
    name: string;
    city?: string;
    groupLink: string;
    memberCount?: number;
  }>;
}

async function fetchCountryDataForEmail(country: string): Promise<CountryEmailData | null> {
  try {
    const firestore = admin.firestore();
    
    // Fetch colivings for this country (limit to 2 best ones)
    const colivingsQuery = firestore.collection('colivings')
      .where('country', '==', country)
      .where('status', '==', 'active')
      .orderBy('rating', 'desc')
      .limit(2);
    
    const colivingsSnapshot = await colivingsQuery.get();
    
    const colivings = colivingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name || 'Unnamed Coliving',
        city: data.city || 'Unknown City',
        country: data.country || country,
        monthlyPrice: data.min_price || data.monthlyPrice || 0,
        website: data.website,
        hasCoworking: !!(data.coworking_access === 'yes' || data.coworking_access === true),
        hasPrivateBathroom: !!(data.amenities && Array.isArray(data.amenities) && data.amenities.includes('Private bathroom'))
      };
    });

    // Fetch country data with communities
    const countryQuery = firestore.collection('countries')
      .where('name', '==', country)
      .limit(1);
    
    const countrySnapshot = await countryQuery.get();
    
    let whatsappGroups: Array<{name: string; city?: string; groupLink: string; memberCount?: number}> = [];
    let attractions: string[] = [];

    if (!countrySnapshot.empty) {
      const countryData = countrySnapshot.docs[0].data();
      
      // Extract WhatsApp groups from communities
      if (Array.isArray(countryData.communities)) {
        whatsappGroups = countryData.communities
          .filter((community: any) => community.platform === 'WhatsApp' && community.groupLink)
          .slice(0, 3) // Limit to 3 groups
          .map((community: any) => ({
            name: community.name,
            city: community.city,
            groupLink: community.groupLink,
            memberCount: community.memberCount
          }));
      }

      // Get popular attractions (using popular_cities as proxy for now)
      if (Array.isArray(countryData.popular_cities)) {
        attractions = countryData.popular_cities.slice(0, 5);
      }
    }

    // If we don't have enough attractions, try to get them from nearby places of colivings
    if (attractions.length < 3 && colivings.length > 0) {
      try {
        const nearbyPlacesDoc = await firestore.collection('coliving_nearby_places')
          .doc(colivingsSnapshot.docs[0].id)
          .get();
        
        if (nearbyPlacesDoc.exists) {
          const nearbyData = nearbyPlacesDoc.data();
          if (nearbyData?.nearby_places) {
            const attractionsFromNearby: string[] = [];
            Object.values(nearbyData.nearby_places).forEach((places: any) => {
              if (Array.isArray(places)) {
                places.slice(0, 2).forEach((place: any) => {
                  if (place.name && place.rating && place.rating > 4.0) {
                    attractionsFromNearby.push(place.name);
                  }
                });
              }
            });
            attractions = [...attractions, ...attractionsFromNearby].slice(0, 5);
          }
        }
      } catch (nearbyError) {
        console.log('Could not fetch nearby places for attractions:', nearbyError);
      }
    }

    return {
      colivings,
      attractions,
      whatsappGroups
    };

  } catch (error) {
    console.error(`Error fetching data for country ${country}:`, error);
    return null;
  }
}

function generateFallbackEmailContent(countries: string[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NomadsHood!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e67e22; margin-bottom: 10px;">🎉 Welcome to NomadsHood!</h1>
            <p style="color: #7f8c8d; font-size: 18px;">Your nomad journey for ${countries.join(', ')} starts here!</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 15px;">🚀 We're preparing something special!</h2>
            <p style="color: #7f8c8d;">Thanks for joining our community! We're currently curating the best coliving spaces, local attractions, and nomad communities for your selected countries.</p>
        </div>

        <div style="background-color: #e67e22; color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="margin-bottom: 15px;">📬 What's Coming Next?</h2>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;">📈 Weekly nomad hacks and tips</li>
                <li style="margin-bottom: 8px;">🎉 Exclusive coliving events</li>
                <li style="margin-bottom: 8px;">✨ Featured nomad stories</li>
                <li style="margin-bottom: 8px;">🎥 Curated YouTube content</li>
                <li style="margin-bottom: 8px;">💰 Monthly budget planning guides</li>
                <li style="margin-bottom: 8px;">📄 Personalized PDF travel guides in your preferred language</li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #7f8c8d;">Questions? Reply to this email or contact us at</p>
            <p><a href="mailto:volkanoluc@gmail.com" style="color: #e67e22; text-decoration: none;">volkanoluc@gmail.com</a></p>
            
            <div style="margin-top: 20px;">
                <a href="https://nomadshood.com" style="color: #e67e22; text-decoration: none; margin-right: 20px;">🏠 Visit Website</a>
                <a href="https://youtube.com/@nomadshood" style="color: #e67e22; text-decoration: none;">🎥 YouTube Channel</a>
            </div>
        </div>

    </body>
    </html>
  `;
}

function generateFallbackPlainTextContent(countries: string[]): string {
  return `🎉 Welcome to NomadsHood!

Your nomad journey for ${countries.join(', ')} starts here!

🚀 We're preparing something special!
Thanks for joining our community! We're currently curating the best coliving spaces, local attractions, and nomad communities for your selected countries.

📬 WHAT'S COMING NEXT?

• Weekly nomad hacks and tips
• Exclusive coliving events
• Featured nomad stories
• Curated YouTube content
• Monthly budget planning guides
• Personalized PDF travel guides in your preferred language

Questions? Contact us at volkanoluc@gmail.com
Visit: https://nomadshood.com
YouTube: https://youtube.com/@nomadshood`;
} 
export { generateTestPdf, onSubscriberCreate };

