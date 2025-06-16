import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { OpenAI } from 'openai';

type GuideData = {
  countryCode: string;
  language: string;
  title: string;
  generatedAt: string;
  sections: {
    countryOverview: {
      title: string;
      content: string;
    };
    internetVisaTips: {
      title: string;
      content: string;
    };
    workingTips: {
      title: string;
      content: string;
    };
    culturalTips: {
      title: string;
      content: string;
    };
    budgetFoodTips: {
      title: string;
      content: string;
    };
  };
  colivings: Array<{
    name: string;
    city?: string;
    country?: string;
    monthlyPrice?: number;
    website?: string;
    nomadshoodUrl?: string;
    nearbyPlaces?: Array<{
      name: string;
      category?: string;
      rating?: number;
    }>;
  }>;
  communities: Array<{
    name: string;
    link: string;
    platform?: string;
    description?: string;
  }>;
  footer: {
    generatedBy: string;
    website: string;
  };
};

const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

async function fetchData(countryCode: string, language: string): Promise<GuideData> {
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
    let nearbyPlaces: Array<{name: string; category?: string; rating?: number}> = [];
    try {
      const nearbyDoc = await db.collection('coliving_nearby_places').doc(colivingId).get();
      if (nearbyDoc.exists) {
        const nearbyData = nearbyDoc.data();
        if (nearbyData?.nearby) {
          nearbyPlaces = nearbyData.nearby.slice(0, 5); // Top 5 nearby places
        }
      }
    } catch (err) {
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
  const communities = countryDoc.exists ? countryDoc.data()?.communities || [] : [];

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

  const text = chat.choices[0]?.message?.content || '';
  
  // Parse the structured response
  const sections = text.split(/\d+\.\s+[A-Z_]+:/);
  const countryOverview = sections[1]?.trim() || 'No overview available.';
  const internetVisaTips = sections[2]?.trim() || 'No internet/visa tips available.';
  const workingTips = sections[3]?.trim() || 'No working tips available.';
  const culturalTips = sections[4]?.trim() || 'No cultural tips available.';
  const budgetFoodTips = sections[5]?.trim() || 'No budget/food tips available.';

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

export async function generateCountryGuide(language: string, countryCode: string): Promise<{ url: string; data: GuideData }> {
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
