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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscribers = getAllSubscribers;
exports.selectColivingForSubscriber = selectColivingForSubscriber;
exports.generatePersonalizedRecommendation = generatePersonalizedRecommendation;
exports.generatePersonalizedEmailHTML = generatePersonalizedEmailHTML;
exports.generatePersonalizedEmailText = generatePersonalizedEmailText;
exports.sendPersonalizedColivingEmail = sendPersonalizedColivingEmail;
exports.sendBatchPersonalizedEmails = sendBatchPersonalizedEmails;
exports.sendTestEmail = sendTestEmail;
const dotenv = __importStar(require("dotenv"));
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
// Load environment variables from .env file
dotenv.config();
/**
 * Convert category key to display-friendly name
 */
function getCategoryDisplayName(category) {
    const categoryMap = {
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'coworking': 'Coworking Space',
        'gym': 'Gym',
        'beach': 'Beach',
        'supermarket': 'Supermarket',
        'public_transport': 'Public Transport',
        'bank': 'Bank/ATM',
        'hospital': 'Healthcare',
        'shopping': 'Shopping',
        'nightlife': 'Nightlife',
        'hiking': 'Outdoor/Hiking'
    };
    return categoryMap[category] || 'Local Spot';
}
/**
 * Get all active subscribers with their country preferences
 */
async function getAllSubscribers() {
    const db = admin.firestore();
    try {
        const subscribersSnapshot = await db
            .collection('mail_subscriber')
            .where('status', '==', 'active')
            .get();
        return subscribersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                language: data.language || 'en',
                countries: data.countries || [],
                name: data.name
            };
        }).filter(subscriber => subscriber.countries.length > 0); // Only subscribers with country preferences
    }
    catch (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }
}
/**
 * Select a coliving from one of the subscriber's preferred countries
 */
async function selectColivingForSubscriber(subscriber) {
    const db = admin.firestore();
    try {
        // Randomly pick one country from subscriber's preferences
        const randomCountry = subscriber.countries[Math.floor(Math.random() * subscriber.countries.length)];
        console.log(`Selecting coliving for ${subscriber.email} from country: ${randomCountry}`);
        // Get colivings from that country - try multiple approaches
        let colivingsSnapshot;
        try {
            // First try: exact country name match with active status
            const colivingsQuery = db
                .collection('colivings')
                .where('country', '==', randomCountry)
                .where('status', '==', 'active')
                .limit(20);
            colivingsSnapshot = await colivingsQuery.get();
            // If no results, try with country code
            if (colivingsSnapshot.empty) {
                console.log(`No colivings found for country name: ${randomCountry}, trying with country code`);
                const colivingsCodeQuery = db
                    .collection('colivings')
                    .where('country_code', '==', randomCountry.toUpperCase())
                    .where('status', '==', 'active')
                    .limit(20);
                colivingsSnapshot = await colivingsCodeQuery.get();
            }
            // If still no results, try case-insensitive search
            if (colivingsSnapshot.empty) {
                console.log(`No colivings found for country code: ${randomCountry}, trying case variations`);
                const variations = [
                    randomCountry.toLowerCase(),
                    randomCountry.toUpperCase(),
                    randomCountry.charAt(0).toUpperCase() + randomCountry.slice(1).toLowerCase()
                ];
                for (const variation of variations) {
                    const variationQuery = db
                        .collection('colivings')
                        .where('country', '==', variation)
                        .where('status', '==', 'active')
                        .limit(20);
                    colivingsSnapshot = await variationQuery.get();
                    if (!colivingsSnapshot.empty)
                        break;
                }
            }
            if (colivingsSnapshot.empty) {
                console.log(`No active colivings found for any variation of: ${randomCountry}`);
                return null;
            }
            // Filter and sort colivings by rating
            const colivings = colivingsSnapshot.docs
                .map(doc => ({ id: doc.id, data: doc.data() }))
                .filter(coliving => coliving.data.rating && coliving.data.rating > 0) // Only colivings with ratings
                .sort((a, b) => (b.data.rating || 0) - (a.data.rating || 0)); // Sort by rating desc
            if (colivings.length === 0) {
                // If no rated colivings, just pick from all active ones
                const randomIndex = Math.floor(Math.random() * colivingsSnapshot.docs.length);
                return colivingsSnapshot.docs[randomIndex].id;
            }
            // Pick from top-rated colivings (top 50% or at least top 5)
            const topColivings = colivings.slice(0, Math.max(5, Math.ceil(colivings.length * 0.5)));
            const randomIndex = Math.floor(Math.random() * topColivings.length);
            return topColivings[randomIndex].id;
        }
        catch (error) {
            console.error(`Error querying colivings for country ${randomCountry}:`, error);
            return null;
        }
    }
    catch (error) {
        console.error(`Error selecting coliving for subscriber ${subscriber.email}:`, error);
        return null;
    }
}
/**
 * Generate personalized coliving recommendation for a subscriber
 */
async function generatePersonalizedRecommendation(subscriber, colivingId) {
    const db = admin.firestore();
    try {
        // Get coliving data
        const colivingDoc = await db.collection('colivings').doc(colivingId).get();
        if (!colivingDoc.exists) {
            console.error(`Coliving ${colivingId} not found`);
            return null;
        }
        const colivingData = colivingDoc.data();
        // Get nearby places using the correct document structure
        const nearbyDoc = await db.collection('coliving_nearby_places').doc(colivingId).get();
        let nearbyPlaces = [];
        if (nearbyDoc.exists) {
            const nearbyData = nearbyDoc.data();
            if (nearbyData === null || nearbyData === void 0 ? void 0 : nearbyData.nearby_places) {
                // Categories to prioritize for email content
                const priorityCategories = ['restaurant', 'cafe', 'coworking', 'gym', 'beach', 'supermarket', 'public_transport'];
                // Extract nearby places from each category
                priorityCategories.forEach(category => {
                    const categoryPlaces = nearbyData.nearby_places[category];
                    if (Array.isArray(categoryPlaces) && categoryPlaces.length > 0) {
                        // Take top 2 places from each category with good ratings
                        categoryPlaces
                            .filter((place) => place.name && place.rating && place.rating >= 4.0)
                            .slice(0, 2)
                            .forEach((place) => {
                            // Convert distance to readable format
                            let distanceText = '';
                            if (place.distance_walking_time) {
                                distanceText = `${place.distance_walking_time} min walk`;
                            }
                            else if (place.distance_meters) {
                                const meters = place.distance_meters;
                                if (meters < 1000) {
                                    distanceText = `${meters}m`;
                                }
                                else {
                                    distanceText = `${(meters / 1000).toFixed(1)}km`;
                                }
                            }
                            nearbyPlaces.push({
                                name: place.name,
                                category: getCategoryDisplayName(category),
                                rating: place.rating,
                                distance: distanceText
                            });
                        });
                    }
                });
            }
        }
        // Limit to best 8 nearby places
        nearbyPlaces = nearbyPlaces
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);
        // Get community links for the country
        const countryCode = colivingData.country_code || colivingData.country;
        let communityLinks = [];
        // Try to find country by code first, then by name
        let countryQuery = db.collection('countries').where('code', '==', countryCode).limit(1);
        let countrySnapshot = await countryQuery.get();
        if (countrySnapshot.empty) {
            countryQuery = db.collection('countries').where('name', '==', colivingData.country).limit(1);
            countrySnapshot = await countryQuery.get();
        }
        if (!countrySnapshot.empty) {
            const countryData = countrySnapshot.docs[0].data();
            if (countryData.communities && Array.isArray(countryData.communities)) {
                communityLinks = countryData.communities
                    .slice(0, 4) // Limit to 4 community links
                    .map((community) => ({
                    platform: community.platform || 'Community',
                    name: community.name,
                    link: community.link || community.groupLink,
                    memberCount: community.memberCount
                }));
            }
        }
        return {
            coliving: {
                id: colivingId,
                name: colivingData.name || 'Featured Coliving',
                city: colivingData.city || 'Unknown City',
                country: colivingData.country || 'Unknown Country',
                countryCode: colivingData.country_code || 'XX',
                monthlyPrice: colivingData.min_price ? parseInt(colivingData.min_price) : undefined,
                rating: colivingData.rating,
                website: colivingData.website,
                description: colivingData.description || 'A wonderful coliving space for digital nomads',
                amenities: colivingData.amenities || [],
                logo: colivingData.logo,
                currency: colivingData.currency
            },
            nearbyPlaces,
            communityLinks,
            selectedCountry: colivingData.country
        };
    }
    catch (error) {
        console.error('Error generating personalized recommendation:', error);
        return null;
    }
}
/**
 * Generate HTML email template for personalized coliving recommendation
 */
function generatePersonalizedEmailHTML(subscriber, recommendation) {
    const { coliving, nearbyPlaces, communityLinks } = recommendation;
    const mainImage = coliving.logo || 'https://via.placeholder.com/600x300/667eea/white?text=Coliving+Recommendation';
    const subscriberName = subscriber.name || 'Fellow Nomad';
    return `
<!DOCTYPE html>
<html lang="${subscriber.language || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Personalized Coliving Recommendation</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .hero-image { 
            width: 100%; 
            height: 300px; 
            object-fit: cover; 
        }
        .content { 
            padding: 30px 20px; 
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section-title { 
            color: #667eea; 
            font-size: 20px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #e9ecef; 
            padding-bottom: 8px; 
        }
        .cta-button { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 12px 25px; 
            border-radius: 6px; 
            text-decoration: none; 
            font-weight: bold; 
            margin: 8px 8px 8px 0; 
        }
        .cta-button:hover { 
            background: #5a6fd8; 
            color: white; 
        }
        .price { 
            color: #28a745; 
            font-weight: bold; 
            font-size: 24px; 
            margin: 10px 0; 
        }
        .rating { 
            color: #ffc107; 
            font-size: 18px; 
        }
        .nearby-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; 
            margin-top: 15px; 
        }
        .nearby-item { 
            background: #f8f9fa; 
            border-radius: 8px; 
            padding: 15px; 
            border-left: 4px solid #667eea; 
        }
        .community-item { 
            background: #e3f2fd; 
            border-radius: 6px; 
            padding: 12px; 
            margin-bottom: 10px; 
            border-left: 3px solid #2196f3; 
        }
        .amenity-tag { 
            background: #e9ecef; 
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            margin: 2px; 
            display: inline-block; 
        }
        .footer { 
            background: #343a40; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .personal-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏡 Your Personal Coliving Pick</h1>
            <p>Curated for your ${recommendation.selectedCountry} preferences</p>
        </div>

        <!-- Hero Image -->
        <img src="${mainImage}" alt="${coliving.name}" class="hero-image">

        <div class="content">
            <!-- Personal Greeting -->
            <div class="personal-note">
                <h2 style="color: #856404; margin-bottom: 10px;">Hi ${subscriberName}! 👋</h2>
                <p style="color: #856404; margin: 0;">Based on your interest in <strong>${recommendation.selectedCountry}</strong>, we found this amazing coliving space just for you!</p>
            </div>

            <!-- Coliving Details -->
            <div class="section" style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #333; margin-bottom: 15px;">${coliving.name}</h2>
                <p style="color: #666; font-size: 18px; margin-bottom: 15px;">📍 ${coliving.city}, ${coliving.country}</p>
                
                ${coliving.monthlyPrice ? `<div class="price">From ${coliving.currency || '€'}${coliving.monthlyPrice}/month</div>` : ''}
                ${coliving.rating ? `<div class="rating">⭐ ${coliving.rating}/5 rating</div>` : ''}
                
                <div style="margin-top: 20px;">
                    ${coliving.website ? `<a href="${coliving.website}" class="cta-button">Visit Website</a>` : ''}
                    <a href="https://maps.google.com/?q=${encodeURIComponent(coliving.name + ' ' + coliving.city)}" class="cta-button" style="background: #4285f4;">📍 View on Maps</a>
                </div>
            </div>

            <!-- Description -->
            <div class="section">
                <h3 class="section-title">✨ Why We Picked This</h3>
                <p>${coliving.description}</p>
                
                ${coliving.amenities.length > 0 ? `
                <h4 style="color: #555; margin-top: 20px;">🛏️ What's Included</h4>
                <div>
                    ${coliving.amenities.slice(0, 8).map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                </div>
                ` : ''}
            </div>

            <!-- Nearby Places -->
            ${nearbyPlaces.length > 0 ? `
            <div class="section">
                <h3 class="section-title">🗺️ What's Around</h3>
                <p style="color: #666; margin-bottom: 20px;">Great spots within walking distance:</p>
                <div class="nearby-grid">
                    ${nearbyPlaces.map(place => `
                        <div class="nearby-item">
                            <h4 style="color: #333; margin-bottom: 5px;">${place.name}</h4>
                            <p style="color: #666; margin-bottom: 8px; font-size: 14px;">${place.category}</p>
                            ${place.rating ? `<div style="color: #ffc107;">⭐ ${place.rating}/5</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Community Links -->
            ${communityLinks.length > 0 ? `
            <div class="section">
                <h3 class="section-title">👥 Join the Local Community</h3>
                <p style="color: #666; margin-bottom: 15px;">Connect with nomads in ${coliving.country}:</p>
                ${communityLinks.map(community => `
                    <div class="community-item">
                        <h4 style="color: #1976d2; margin-bottom: 5px;">${community.name}</h4>
                        <p style="color: #666; margin-bottom: 8px; font-size: 14px;">
                            ${community.platform}${community.memberCount ? ` • ${community.memberCount} members` : ''}
                        </p>
                        <a href="${community.link}" style="color: #1976d2; text-decoration: none; font-weight: bold;">Join Group →</a>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Call to Action -->
            <div class="section" style="text-align: center; background: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">Ready for Your Next Adventure?</h3>
                <p style="margin-bottom: 20px;">This coliving space in ${coliving.country} could be your perfect base!</p>
                ${coliving.website ? `<a href="${coliving.website}" class="cta-button" style="font-size: 16px;">Book Your Stay</a>` : ''}
                <a href="https://nomadshood.com/colivings/${coliving.countryCode.toLowerCase()}" class="cta-button" style="background: #28a745;">Explore More in ${coliving.country}</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Happy nomading! 🌍✈️</p>
            <p style="margin-top: 15px;">
                <a href="https://nomadshood.com" style="color: #adb5bd; margin-right: 15px;">Visit NomadsHood</a>
                <a href="https://nomadshood.com/newsletter/cancel" style="color: #adb5bd;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
/**
 * Generate plain text email for personalized coliving recommendation
 */
function generatePersonalizedEmailText(subscriber, recommendation) {
    const { coliving, nearbyPlaces, communityLinks } = recommendation;
    const subscriberName = subscriber.name || 'Fellow Nomad';
    let text = `
🏡 YOUR PERSONAL COLIVING PICK
Curated for your ${recommendation.selectedCountry} preferences

Hi ${subscriberName}! 👋

Based on your interest in ${recommendation.selectedCountry}, we found this amazing coliving space just for you!

${coliving.name}
📍 ${coliving.city}, ${coliving.country}

`;
    if (coliving.monthlyPrice) {
        text += `💰 From ${coliving.currency || '€'}${coliving.monthlyPrice}/month\n`;
    }
    if (coliving.rating) {
        text += `⭐ ${coliving.rating}/5 rating\n`;
    }
    text += `\n✨ WHY WE PICKED THIS\n${'='.repeat(25)}\n`;
    text += `${coliving.description}\n\n`;
    if (coliving.amenities.length > 0) {
        text += `🛏️ What's Included: ${coliving.amenities.slice(0, 6).join(', ')}\n\n`;
    }
    if (nearbyPlaces.length > 0) {
        text += `🗺️ WHAT'S AROUND\n${'='.repeat(16)}\n`;
        text += `Great spots within walking distance:\n\n`;
        nearbyPlaces.forEach(place => {
            text += `• ${place.name} (${place.category})`;
            if (place.rating)
                text += ` ⭐ ${place.rating}/5`;
            text += `\n`;
        });
        text += `\n`;
    }
    if (communityLinks.length > 0) {
        text += `👥 JOIN THE LOCAL COMMUNITY\n${'='.repeat(28)}\n`;
        text += `Connect with nomads in ${coliving.country}:\n\n`;
        communityLinks.forEach(community => {
            text += `${community.name} (${community.platform})\n`;
            text += `${community.link}\n\n`;
        });
    }
    if (coliving.website) {
        text += `🌐 Book Your Stay: ${coliving.website}\n`;
    }
    text += `🗺️ View on Maps: https://maps.google.com/?q=${encodeURIComponent(coliving.name + ' ' + coliving.city)}\n`;
    text += `🔗 Explore More: https://nomadshood.com/colivings/${coliving.countryCode.toLowerCase()}\n`;
    text += `\nHappy nomading! 🌍✈️\n`;
    text += `Visit us: https://nomadshood.com\n`;
    text += `Unsubscribe: https://nomadshood.com/newsletter/cancel`;
    return text;
}
/**
 * Initialize Resend client
 */
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is required');
    }
    return new resend_1.Resend(apiKey);
}
/**
 * Send personalized coliving email using Resend
 */
async function sendPersonalizedColivingEmail(subscriber, recommendation) {
    var _a, _b;
    try {
        const resend = getResendClient();
        const htmlContent = generatePersonalizedEmailHTML(subscriber, recommendation);
        const textContent = generatePersonalizedEmailText(subscriber, recommendation);
        const result = await resend.emails.send({
            from: 'NomadsHood <hello@nomadshood.com>',
            to: [subscriber.email],
            subject: `🏡 Your Perfect Coliving in ${recommendation.selectedCountry} - ${recommendation.coliving.name}`,
            html: htmlContent,
            text: textContent,
            headers: {
                'X-Entity-Ref-ID': subscriber.id,
            },
            tags: [
                { name: 'campaign', value: 'weekly-coliving-recommendations' },
                { name: 'country', value: recommendation.selectedCountry },
                { name: 'coliving_id', value: recommendation.coliving.id }
            ]
        });
        if (result.error) {
            console.error(`Failed to send email to ${subscriber.email}:`, result.error);
            return { success: false, error: result.error.message };
        }
        console.log(`✅ Email sent successfully to ${subscriber.email} - Message ID: ${(_a = result.data) === null || _a === void 0 ? void 0 : _a.id}`);
        return { success: true, messageId: (_b = result.data) === null || _b === void 0 ? void 0 : _b.id };
    }
    catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
/**
 * Send batch of personalized emails with rate limiting
 */
async function sendBatchPersonalizedEmails(emailData) {
    const results = [];
    let totalSent = 0;
    let totalFailed = 0;
    console.log(`📧 Starting batch email send for ${emailData.length} subscribers`);
    for (let i = 0; i < emailData.length; i++) {
        const { subscriber, recommendation } = emailData[i];
        try {
            console.log(`📤 Sending email ${i + 1}/${emailData.length} to ${subscriber.email}`);
            const result = await sendPersonalizedColivingEmail(subscriber, recommendation);
            results.push({
                email: subscriber.email,
                success: result.success,
                messageId: result.messageId,
                error: result.error
            });
            if (result.success) {
                totalSent++;
            }
            else {
                totalFailed++;
            }
            // Rate limiting: wait 1 second between emails to respect Resend limits
            if (i < emailData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        catch (error) {
            console.error(`Error processing email for ${subscriber.email}:`, error);
            results.push({
                email: subscriber.email,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            totalFailed++;
        }
    }
    console.log(`📊 Batch email results: ${totalSent} sent, ${totalFailed} failed`);
    return {
        totalSent,
        totalFailed,
        results
    };
}
/**
 * Send test email to admin/developer
 */
async function sendTestEmail(testEmail, subscriber, recommendation) {
    var _a, _b;
    try {
        const resend = getResendClient();
        const htmlContent = generatePersonalizedEmailHTML(subscriber, recommendation);
        const textContent = generatePersonalizedEmailText(subscriber, recommendation);
        const result = await resend.emails.send({
            from: 'NomadsHood Test <hello@nomadshood.com>',
            to: [testEmail],
            subject: `🧪 TEST: Coliving Email for ${recommendation.selectedCountry} - ${recommendation.coliving.name}`,
            html: `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">🧪 TEST EMAIL</h3>
          <p style="color: #856404; margin: 0;">This is a test of the weekly coliving recommendation email system.</p>
          <p style="color: #856404; margin: 5px 0 0 0;"><strong>Test subscriber:</strong> ${subscriber.email}</p>
        </div>
        ${htmlContent}
      `,
            text: `🧪 TEST EMAIL - This is a test of the weekly coliving recommendation system.\nTest subscriber: ${subscriber.email}\n\n${textContent}`,
            headers: {
                'X-Entity-Ref-ID': `test-${subscriber.id}`,
            },
            tags: [
                { name: 'campaign', value: 'test-weekly-coliving-recommendations' },
                { name: 'country', value: recommendation.selectedCountry },
                { name: 'test', value: 'true' }
            ]
        });
        if (result.error) {
            console.error(`Failed to send test email to ${testEmail}:`, result.error);
            return { success: false, error: result.error.message };
        }
        console.log(`✅ Test email sent successfully to ${testEmail} - Message ID: ${(_a = result.data) === null || _a === void 0 ? void 0 : _a.id}`);
        return { success: true, messageId: (_b = result.data) === null || _b === void 0 ? void 0 : _b.id };
    }
    catch (error) {
        console.error(`Error sending test email to ${testEmail}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
//# sourceMappingURL=countryBasedColivingEmail.js.map