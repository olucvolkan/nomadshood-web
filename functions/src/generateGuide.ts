import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';

type GuideSections = {
  countryOverview: string;
  internetVisaTips: string;
  budgetFoodTips: string;
  colivings: any[];
  nearby: any[];
  communities: any[];
};

const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

async function fetchData(country: string): Promise<GuideSections> {
  const db = admin.firestore();

  const colivingsSnap = await db
    .collection('colivings')
    .where('country', '==', country)
    .limit(5)
    .get();
  const colivings = colivingsSnap.docs.map((d) => d.data());

  const countryDoc = await db.collection('countries').doc(country).get();
  const communities = countryDoc.exists ? countryDoc.data()?.community_links || [] : [];

  const nearbyDoc = await db.collection('coliving_nearby_places').doc(country).get();
  const nearby = nearbyDoc.exists ? nearbyDoc.data()?.nearby || [] : [];

  const prompt = `Write a short digital nomad guide for ${country}. Include a one paragraph overview, internet tips, visa information and budget advice.`;
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  const text = chat.choices[0]?.message?.content || '';
  const [countryOverview = '', internetVisaTips = '', budgetFoodTips = ''] = text.split('\n').map((s) => s.trim());

  return { countryOverview, internetVisaTips, budgetFoodTips, colivings, nearby, communities };
}

function renderHtml(data: GuideSections, language: string, country: string): string {
  const colivingHtml = data.colivings.map((c) => `<li>${c.name || 'Coliving'}</li>`).join('');
  const nearbyHtml = data.nearby.map((n: any) => `<li>${n.name || 'Place'}</li>`).join('');
  const communityHtml = data.communities.map((c: any) => `<li><a href="${c.link}">${c.name}</a></li>`).join('');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<title>${country} Guide</title>
</head>
<body>
<h1>${country} Guide</h1>
<h2>Overview</h2>
<p>${data.countryOverview}</p>
<h2>Internet & Visa Tips</h2>
<p>${data.internetVisaTips}</p>
<h2>Top Colivings</h2>
<ul>${colivingHtml}</ul>
<h2>Nearby Spots</h2>
<ul>${nearbyHtml}</ul>
<h2>Community Links</h2>
<ul>${communityHtml}</ul>
<h2>Budget & Food Tips</h2>
<p>${data.budgetFoodTips}</p>
</body>
</html>`;
}

export async function generateCountryGuide(language: string, country: string): Promise<string> {
  const bucket = admin.storage().bucket();
  const filePath = `pdfs/${language}/${country}.pdf`;
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (exists) {
    return file.publicUrl();
  }

  const data = await fetchData(country);
  const html = renderHtml(data, language, country);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  await file.save(pdfBuffer, { contentType: 'application/pdf' });
  await file.makePublic();
  return file.publicUrl();
}
