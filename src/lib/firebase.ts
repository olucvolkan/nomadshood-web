
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

// Define the expected structure of the config for clarity
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const firebaseConfigValues: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Basic check for essential configuration keys
const requiredKeys: Array<keyof FirebaseConfig> = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  const value = firebaseConfigValues[key];
  const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase().replace('DATABASE_U_R_L','DATABASE_URL')}`;
  
  // Check if the value is missing or is still a placeholder
  if (!value || value.startsWith('YOUR_') || value.startsWith('your_') || value.trim() === '') {
    const errorMessage = `Firebase configuration error: The environment variable ${envVarName} (for Firebase config key '${key}') in your .env file appears to be missing, empty, or is still using a placeholder value (e.g., "YOUR_..."). ` +
      `The current value found is "${value}". ` +
      `You MUST update this in your .env file with your actual Firebase project credential. ` +
      `After updating your .env file, remember to RESTART your development server.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Specific check for databaseURL format after ensuring it's not a placeholder
if (firebaseConfigValues.databaseURL && !(firebaseConfigValues.databaseURL.startsWith('https://') && (firebaseConfigValues.databaseURL.endsWith('.firebaseio.com') || firebaseConfigValues.databaseURL.endsWith('.firebasedatabase.app')))) {
    const errorMessage = `Firebase configuration error: The NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${firebaseConfigValues.databaseURL}") in your .env file is not a valid Firebase Realtime Database URL. ` +
      `It MUST start with "https://" and end with ".firebaseio.com" or ".firebasedatabase.app". ` +
      `Please correct this in your .env file and RESTART your development server.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
}

// Cast to Required after checks, Firebase SDK will do more thorough validation
const firebaseConfig = firebaseConfigValues as Required<FirebaseConfig>;

let app: FirebaseApp;
let db: Database;

// Initialize Firebase App
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase initialization error (initializeApp call):", error.message);
    let detailedMessage = `Failed to initialize Firebase app. Original error: ${error.message}.`;
    if (error.message.includes("Invalid Firebase config")) {
      detailedMessage += " This often means some essential Firebase config values (apiKey, projectId, databaseURL, etc.) are missing or incorrect in your .env file, or were not loaded correctly (ensure server restart after .env changes).";
    }
    throw new Error(detailedMessage);
  }
} else {
  app = getApps()[0]; // Use the existing app
}

// Get Database instance
try {
  db = getDatabase(app);
} catch (error: any) {
  console.error("Firebase getDatabase error:", error.message);
  let detailedMessage = `Failed to get Firebase Database instance. Original error: ${error.message}.`;
  if (error.message.toLowerCase().includes("cannot parse firebase url") || error.message.toLowerCase().includes("databaseurl")) {
    detailedMessage += ` This usually means the databaseURL ("${firebaseConfig.databaseURL}") in your Firebase config (from NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env) is incorrect, missing, or the Realtime Database is not enabled/properly set up for your Firebase project. It must start with 'https://' and end with '.firebaseio.com' or '.firebasedatabase.app'.`;
  }
  throw new Error(detailedMessage);
}

export { app, db };
