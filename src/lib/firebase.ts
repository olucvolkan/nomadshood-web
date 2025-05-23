
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
  // Validate that the databaseURL is provided and looks like a URL
  // This is a basic check; Firebase SDK will do more thorough validation
  if (!firebaseConfig.databaseURL || !firebaseConfig.databaseURL.startsWith('https://')) {
    console.error(
      'Firebase Database URL is missing or incorrectly formatted in your .env file. ' +
      'It should start with "https://" and end with ".firebaseio.com" or ".firebasedatabase.app". ' +
      `Current value: ${firebaseConfig.databaseURL}`
    );
    // Depending on how critical this is, you might throw an error here or let Firebase SDK handle it
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Use the existing app
}

const db: Database = getDatabase(app);

export { app, db };
