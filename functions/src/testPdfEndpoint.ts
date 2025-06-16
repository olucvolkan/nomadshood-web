import * as functions from 'firebase-functions';
import { generateCountryGuide } from './generateGuide';

export const generateTestPdf = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  try {
    // Get parameters from query string or body
    const language = req.query.language as string || req.body?.language || 'en';
    const countryCode = req.query.countryCode as string || req.body?.countryCode;

    if (!countryCode) {
      res.status(400).json({ 
        error: 'countryCode parameter is required',
        example: '/generateTestPdf?countryCode=TR&language=en'
      });
      return;
    }

    console.log(`Generating guide data for country: ${countryCode}, language: ${language}`);

    // Generate the guide data
    const result = await generateCountryGuide(language, countryCode);

    // Return the JSON data
    res.set('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      jsonUrl: result.url,
      data: result.data
    });

  } catch (error) {
    console.error('Error generating guide data:', error);
    res.status(500).json({ 
      error: 'Failed to generate guide data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}); 