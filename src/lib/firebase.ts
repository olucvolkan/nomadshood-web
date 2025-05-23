
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

// Define the expected structure of the config for clarity and checks
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

// Check for missing or placeholder values for critical Firebase config keys
const criticalConfigKeys: Array<keyof FirebaseConfig> = [
  'apiKey', 
  'authDomain', 
  'databaseURL', 
  'projectId', 
  'storageBucket', 
  'messagingSenderId', 
  'appId'
];

for (const key of criticalConfigKeys) {
  const value = firebaseConfigValues[key];
  // Construct the likely environment variable name for a more helpful error message
  const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase().replace('DATABASE_U_R_L','DATABASE_URL')}`;

  if (!value || typeof value !== 'string' || value.startsWith('YOUR_') || value.startsWith('<YOUR_') || value.trim() === '') {
    const errorMessage = 
      `Firebase configuration error: The config for '${key}' (from environment variable ${envVarName}) is missing, uses a placeholder value, or is empty in your .env file. ` +
      `Please ensure all NEXT_PUBLIC_FIREBASE_... variables are correctly set with your actual Firebase project credentials and that you have RESTARTED your development server. ` +
      `Current value for '${key}': "${value}"`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Specific check for databaseURL format, as this is a common error source
const dbURL = firebaseConfigValues.databaseURL;
if (dbURL && (!dbURL.startsWith('https://') || !(dbURL.endsWith('.firebaseio.com') || dbURL.endsWith('.firebasedatabase.app')))) {
  const dbErrorMessage = 
    `Firebase configuration error: The databaseURL ("${dbURL}") (from NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env) is incorrectly formatted. ` +
    `It MUST start with 'https://' and end with '.firebaseio.com' or '.firebasedatabase.app'. Example: https://your-project-id.firebaseio.com. ` +
    `Please check your .env file and RESTART your development server.`;
  console.error(dbErrorMessage);
  throw new Error(dbErrorMessage);
}

const firebaseConfig = firebaseConfigValues as Required<FirebaseConfig>; // Cast to Required as we've checked critical keys

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
      detailedMessage += " This often means some essential Firebase config values (apiKey, projectId, etc.) are missing or incorrect in your .env file, or NEXT_PUBLIC_FIREBASE_DATABASE_URL might be malformed.";
    }
    throw new Error(detailedMessage);
  }
} else {
  app = getApps()[0]; // Use the existing app
}

// Get Database instance
try {
  // It's crucial that firebaseConfig.databaseURL is correct here.
  // The error "FIREBASE FATAL ERROR: Cannot parse Firebase url" originates from this call if the URL is malformed.
  db = getDatabase(app);
} catch (error: any) {
  console.error("Firebase getDatabase error:", error.message);
  // Provide more context for the error.
  let detailedMessage = `Failed to get Firebase Database instance. Original error: ${error.message}.`;
  if (error.message.toLowerCase().includes("cannot parse firebase url") || error.message.toLowerCase().includes("databaseurl")) {
    detailedMessage += ` This usually means the databaseURL ("${firebaseConfig.databaseURL}") in your Firebase config (from NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env) is incorrect, missing, or the Realtime Database is not enabled/properly set up for your Firebase project. It must start with 'https://' and end with '.firebaseio.com' or '.firebasedatabase.app'.`;
  }
  throw new Error(detailedMessage);
}

export { app, db };
