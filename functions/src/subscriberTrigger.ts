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
    const links: string[] = [];

    for (const country of data.countries) {
      try {
        const url = await generateCountryGuide(language, country);
        links.push(`${country}: ${url}`);
      } catch (err) {
        console.error('Error generating guide for', country, err);
      }
    }

    if (links.length > 0) {
      await resend.emails.send({
        from: 'info@nomadshood.com',
        to: data.email,
        subject: 'Your Nomad Guides',
        text: `Here are your guides:\n${links.join('\n')}`,
      });
    }

    await snap.ref.update({ pdfGenerated: true, emailSent: true });
  });
