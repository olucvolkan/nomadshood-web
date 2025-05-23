
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Database;

// Check if Firebase has already been initialized
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase initialization error:", error.message);
    // Provide more context for the error.
    let detailedMessage = `Failed to initialize Firebase. Please check your Firebase config in .env. Original error: ${error.message}. Ensure all NEXT_PUBLIC_FIREBASE_... variables are correctly set.`;
    if (error.message.includes("Invalid Firebase config")) {
      detailedMessage += " This often means some essential Firebase config values (apiKey, projectId, etc.) are missing or incorrect in your .env file.";
    }
    throw new Error(detailedMessage);
  }
} else {
  app = getApps()[0]; // Use the existing app
}

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
