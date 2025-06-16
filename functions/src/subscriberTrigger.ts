import * as functions from 'firebase-functions';
import { Resend } from 'resend';
import { generateCountryGuide } from './generateGuide';

const getResend = () => {
  const apiKey = functions.config().resend?.api_key;
  if (!apiKey) throw new Error('Resend API key not set');
  return new Resend(apiKey);
};

export const onSubscriberCreate = functions.firestore
  .document('subscribers/{subscriberId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() as { email: string; language?: string; countries: string[] };
    const language = data.language || 'en';
    const resend = getResend();
    const guideLinks: string[] = [];
    const guideData: any[] = [];

    for (const countryCode of data.countries) {
      try {
        const result = await generateCountryGuide(language, countryCode);
        guideLinks.push(`${countryCode}: ${result.url}`);
        guideData.push({
          countryCode,
          jsonUrl: result.url,
          data: result.data
        });
      } catch (err) {
        console.error('Error generating guide data for', countryCode, err);
      }
    }

    if (guideLinks.length > 0) {
      await resend.emails.send({
        from: 'info@nomadshood.com',
        to: data.email,
        subject: 'Your Nomad Guide Data is Ready!',
        text: `Hello! Your personalized nomad guide data has been generated.\n\nCountries included: ${data.countries.join(', ')}\n\nGuide data URLs:\n${guideLinks.join('\n')}\n\nYou can use this data to generate beautiful PDF guides.\n\nHappy travels!`,
        // Note: PDF generation will be handled via Placid using the JSON data
      });
    }

    // Store guide data in the document for future reference
    await snap.ref.update({ 
      guideDataGenerated: true, 
      emailSent: true,
      guideData: guideData
    });
  });
