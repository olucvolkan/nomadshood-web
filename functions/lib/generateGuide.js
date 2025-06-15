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
exports.generateCountryGuide = generateCountryGuide;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const openai_1 = require("openai");
const puppeteer_1 = __importDefault(require("puppeteer"));
const openai = new openai_1.OpenAI({
    apiKey: functions.config().openai.api_key,
});
async function fetchData(country) {
    var _a, _b, _c, _d;
    const db = admin.firestore();
    const colivingsSnap = await db
        .collection('colivings')
        .where('country', '==', country)
        .limit(5)
        .get();
    const colivings = colivingsSnap.docs.map((d) => d.data());
    const countryDoc = await db.collection('countries').doc(country).get();
    const communities = countryDoc.exists ? ((_a = countryDoc.data()) === null || _a === void 0 ? void 0 : _a.community_links) || [] : [];
    const nearbyDoc = await db.collection('coliving_nearby_places').doc(country).get();
    const nearby = nearbyDoc.exists ? ((_b = nearbyDoc.data()) === null || _b === void 0 ? void 0 : _b.nearby) || [] : [];
    const prompt = `Write a short digital nomad guide for ${country}. Include a one paragraph overview, internet tips, visa information and budget advice.`;
    const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
    });
    const text = ((_d = (_c = chat.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '';
    const [countryOverview = '', internetVisaTips = '', budgetFoodTips = ''] = text.split('\n').map((s) => s.trim());
    return { countryOverview, internetVisaTips, budgetFoodTips, colivings, nearby, communities };
}
function renderHtml(data, language, country) {
    const colivingHtml = data.colivings.map((c) => `<li>${c.name || 'Coliving'}</li>`).join('');
    const nearbyHtml = data.nearby.map((n) => `<li>${n.name || 'Place'}</li>`).join('');
    const communityHtml = data.communities.map((c) => `<li><a href="${c.link}">${c.name}</a></li>`).join('');
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
async function generateCountryGuide(language, country) {
    const bucket = admin.storage().bucket();
    const filePath = `pdfs/${language}/${country}.pdf`;
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (exists) {
        return file.publicUrl();
    }
    const data = await fetchData(country);
    const html = renderHtml(data, language, country);
    const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    await file.save(pdfBuffer, { contentType: 'application/pdf' });
    await file.makePublic();
    return file.publicUrl();
}
//# sourceMappingURL=generateGuide.js.map