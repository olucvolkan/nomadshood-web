"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriberSyncStatus = exports.retrySyncToMailerLite = exports.syncSubscriberToMailerLite = exports.stripeWebhook = exports.createNewsletterCheckout = void 0;
const axios_1 = __importDefault(require("axios"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Initialize Stripe with secret key from config
const getStripe = () => {
    var _a;
    const stripeSecretKey = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key;
    if (!stripeSecretKey) {
        throw new Error('Stripe secret key not found in Firebase config');
    }
    return new stripe_1.default(stripeSecretKey, {
        apiVersion: '2025-05-28.basil',
    });
};
/**
 * Create Stripe checkout session for newsletter subscription
 */
exports.createNewsletterCheckout = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        const { email, countries } = data;
        if (!email || !countries || !Array.isArray(countries) || countries.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Email and countries are required');
        }
        const stripe = getStripe();
        // Create or retrieve customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1,
        });
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        }
        else {
            customer = await stripe.customers.create({
                email: email,
                metadata: {
                    countries: countries.join(', '),
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
                            description: 'Monthly premium nomad content and insights',
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
            success_url: `${((_a = functions.config().app) === null || _a === void 0 ? void 0 : _a.url) || 'http://localhost:9002'}/newsletter/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${((_b = functions.config().app) === null || _b === void 0 ? void 0 : _b.url) || 'http://localhost:9002'}/#newsletter`,
            metadata: {
                email: email,
                countries: countries.join(', '),
                source: 'nomadshood_newsletter'
            }
        });
        // Store pending subscription in Firestore
        const pendingSubscription = {
            email: email,
            countries: countries,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentStatus: 'pending',
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
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
});
/**
 * Handle Stripe webhook events
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    const stripe = getStripe();
    const webhookSecret = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret;
    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        res.status(400).send('Webhook secret not configured');
        return;
    }
    let event;
    try {
        const signature = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).send('Webhook signature verification failed');
        return;
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Webhook processing failed');
    }
});
async function handleCheckoutCompleted(session) {
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
        const activeSubscription = {
            email: pendingData.email,
            countries: pendingData.countries,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentStatus: 'completed',
            paymentId: session.payment_intent,
            stripeSessionId: session.id,
            stripeCustomerId: session.customer,
            active: true
        };
        // Add to active subscribers collection
        await admin.firestore()
            .collection('mail_subscriber')
            .add(activeSubscription);
        // Delete pending subscription
        await pendingDoc.ref.delete();
        console.log('Successfully activated subscription for:', pendingData.email);
    }
    catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}
async function handlePaymentSucceeded(invoice) {
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
async function handlePaymentFailed(invoice) {
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
async function handleSubscriptionCanceled(subscription) {
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
exports.syncSubscriberToMailerLite = functions.firestore
    .document('mail_subscriber/{subscriberId}')
    .onCreate(async (snap, context) => {
    var _a, _b;
    try {
        const subscriberData = snap.data();
        const subscriberId = context.params.subscriberId;
        console.log(`New subscriber added: ${subscriberId}`, subscriberData);
        // Only sync if payment is completed
        if (subscriberData.paymentStatus !== 'completed') {
            console.log('Skipping sync - payment not completed');
            return;
        }
        // Get MailerLite API key from environment variables
        const mailerLiteApiKey = (_a = functions.config().mailerlite) === null || _a === void 0 ? void 0 : _a.api_key;
        if (!mailerLiteApiKey) {
            console.error('MailerLite API key not found in Firebase config');
            return;
        }
        // Prepare MailerLite subscriber data
        const mailerLiteData = {
            email: subscriberData.email,
            fields: {
                countries: subscriberData.countries.join(', '),
                created_at: subscriberData.createdAt.toDate().toISOString(),
                payment_status: subscriberData.paymentStatus || 'pending',
                source: 'nomadshood_website'
            },
            status: 'active' // Set as active since payment completed
        };
        // Add to MailerLite
        const response = await axios_1.default.post('https://connect.mailerlite.com/api/subscribers', mailerLiteData, {
            headers: {
                'Authorization': `Bearer ${mailerLiteApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Successfully added subscriber to MailerLite:', response.data);
        // Update Firestore document with MailerLite subscriber ID
        await snap.ref.update({
            mailerLiteId: (_b = response.data.data) === null || _b === void 0 ? void 0 : _b.id,
            mailerLiteSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            mailerLiteStatus: 'synced'
        });
        console.log(`Subscriber ${subscriberId} successfully synced to MailerLite`);
    }
    catch (error) {
        console.error('Error syncing subscriber to MailerLite:', error);
        // Update document with error status
        try {
            await snap.ref.update({
                mailerLiteStatus: 'error',
                mailerLiteError: error instanceof Error ? error.message : 'Unknown error',
                mailerLiteLastAttempt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        catch (updateError) {
            console.error('Error updating document with error status:', updateError);
        }
        // Don't throw the error to prevent Cloud Function retries
        // The error is logged and stored in Firestore for manual review
    }
});
/**
 * Manual sync function to retry failed syncs or sync existing subscribers
 */
exports.retrySyncToMailerLite = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
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
        const subscriberData = doc.data();
        // Get MailerLite API key
        const mailerLiteApiKey = (_a = functions.config().mailerlite) === null || _a === void 0 ? void 0 : _a.api_key;
        if (!mailerLiteApiKey) {
            throw new functions.https.HttpsError('failed-precondition', 'MailerLite API key not configured');
        }
        // Prepare MailerLite subscriber data
        const mailerLiteData = {
            email: subscriberData.email,
            fields: {
                countries: subscriberData.countries.join(', '),
                created_at: subscriberData.createdAt.toDate().toISOString(),
                payment_status: subscriberData.paymentStatus || 'pending',
                source: 'nomadshood_website_retry'
            },
            status: subscriberData.paymentStatus === 'completed' ? 'active' : 'unconfirmed'
        };
        // Add to MailerLite
        const response = await axios_1.default.post('https://connect.mailerlite.com/api/subscribers', mailerLiteData, {
            headers: {
                'Authorization': `Bearer ${mailerLiteApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        // Update Firestore document
        await doc.ref.update({
            mailerLiteId: (_b = response.data.data) === null || _b === void 0 ? void 0 : _b.id,
            mailerLiteSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            mailerLiteStatus: 'synced'
        });
        return { success: true, mailerLiteId: (_c = response.data.data) === null || _c === void 0 ? void 0 : _c.id };
    }
    catch (error) {
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
exports.getSubscriberSyncStatus = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error getting sync status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get sync status');
    }
});
//# sourceMappingURL=index.js.map