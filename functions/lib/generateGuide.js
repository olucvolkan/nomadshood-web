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
exports.generateCountryGuide = generateCountryGuide;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const openai_1 = require("openai");
const openai = new openai_1.OpenAI({
    apiKey: functions.config().openai.api_key,
});
async function fetchData(countryCode, language) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const db = admin.firestore();
    // Fetch all colivings for this country
    const colivingsSnap = await db
        .collection('colivings')
        .where('country_code', '==', countryCode)
        .get();
    const colivings = [];
    for (const doc of colivingsSnap.docs) {
        const data = doc.data();
        const colivingId = doc.id;
        // Fetch nearby places for this coliving
        let nearbyPlaces = [];
        try {
            const nearbyDoc = await db.collection('coliving_nearby_places').doc(colivingId).get();
            if (nearbyDoc.exists) {
                const nearbyData = nearbyDoc.data();
                if (nearbyData === null || nearbyData === void 0 ? void 0 : nearbyData.nearby) {
                    nearbyPlaces = nearbyData.nearby.slice(0, 5); // Top 5 nearby places
                }
            }
        }
        catch (err) {
            console.log(`Could not fetch nearby places for coliving ${colivingId}`);
        }
        colivings.push({
            name: data.name || 'Unnamed Coliving',
            city: data.city,
            country: data.country,
            monthlyPrice: data.monthlyPrice || data.min_price,
            website: data.website,
            nomadshoodUrl: `https://nomadshood.com/colivings/${countryCode}/${data.slug || colivingId}`,
            nearbyPlaces
        });
    }
    // Fetch country data for communities
    const countryDoc = await db.collection('countries').doc(countryCode).get();
    const communities = countryDoc.exists ? ((_a = countryDoc.data()) === null || _a === void 0 ? void 0 : _a.communities) || [] : [];
    // Generate comprehensive content with OpenAI
    const prompt = `Write a comprehensive 2-page digital nomad guide for ${countryCode}. 

  Please structure your response with clear sections:
  
  1. COUNTRY_OVERVIEW: Write 2-3 detailed paragraphs about why ${countryCode} is perfect for digital nomads. Include information about the lifestyle, culture, digital infrastructure, and what makes it special for remote workers. Make it engaging and informative.
  
  2. INTERNET_VISA_TIPS: Provide detailed and practical information about internet speeds, reliable wifi spots, coworking spaces, visa requirements for digital nomads, visa processes, and any digital nomad visa programs available.
  
  3. WORKING_TIPS: Provide advice about best places to work, time zones, business culture, networking opportunities, and productivity tips specific to this country.
  
  4. CULTURAL_TIPS: Share insights about local customs, language basics, cultural dos and don'ts, social norms, and how to integrate with the local community.
  
  5. BUDGET_FOOD_TIPS: Give specific budget ranges, cost of living details, local food recommendations, where to eat affordably, grocery shopping tips, and local food culture insights.
  
  Make each section detailed and practical. Write in an engaging, informative tone that would be valuable for someone planning to spend months in ${countryCode} as a digital nomad.`;
    const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
    });
    const text = ((_c = (_b = chat.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
    // Parse the structured response
    const sections = text.split(/\d+\.\s+[A-Z_]+:/);
    const countryOverview = ((_d = sections[1]) === null || _d === void 0 ? void 0 : _d.trim()) || 'No overview available.';
    const internetVisaTips = ((_e = sections[2]) === null || _e === void 0 ? void 0 : _e.trim()) || 'No internet/visa tips available.';
    const workingTips = ((_f = sections[3]) === null || _f === void 0 ? void 0 : _f.trim()) || 'No working tips available.';
    const culturalTips = ((_g = sections[4]) === null || _g === void 0 ? void 0 : _g.trim()) || 'No cultural tips available.';
    const budgetFoodTips = ((_h = sections[5]) === null || _h === void 0 ? void 0 : _h.trim()) || 'No budget/food tips available.';
    return {
        countryCode,
        language,
        title: `${countryCode} Digital Nomad Guide`,
        generatedAt: new Date().toISOString(),
        sections: {
            countryOverview: {
                title: 'Country Overview',
                content: countryOverview
            },
            internetVisaTips: {
                title: 'Internet & Visa Tips',
                content: internetVisaTips
            },
            workingTips: {
                title: 'Working Tips',
                content: workingTips
            },
            culturalTips: {
                title: 'Cultural Tips',
                content: culturalTips
            },
            budgetFoodTips: {
                title: 'Budget & Food Tips',
                content: budgetFoodTips
            }
        },
        colivings,
        communities,
        footer: {
            generatedBy: 'NomadsHood.com',
            website: 'https://nomadshood.com'
        }
    };
}
async function generateCountryGuide(language, countryCode) {
    const bucket = admin.storage().bucket();
    const filePath = `guide-data/${language}/${countryCode}.json`;
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (exists) {
        // If file exists, download it to get the data
        const [buffer] = await file.download();
        const data = JSON.parse(buffer.toString());
        return {
            url: file.publicUrl(),
            data: data
        };
    }
    const data = await fetchData(countryCode, language);
    const jsonString = JSON.stringify(data, null, 2);
    await file.save(jsonString, { contentType: 'application/json' });
    await file.makePublic();
    return {
        url: file.publicUrl(),
        data: data
    };
}
//# sourceMappingURL=generateGuide.js.map