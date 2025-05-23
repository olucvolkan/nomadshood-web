
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Crucial: This must be correctly formatted in .env
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;

// Check if Firebase has already been initialized
if (!getApps().length) {
  // Firebase SDK will perform its own validation of the databaseURL.
  // If firebaseConfig.databaseURL is undefined or malformed, 
  // initializeApp or getDatabase will throw an appropriate error.
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Use the existing app
}

const db: Database = getDatabase(app);

export { app, db };
