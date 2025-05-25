
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Updated import for Firestore

// Define the expected structure of the config for clarity
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string; // Kept for potential other uses, but Firestore doesn't use it for its primary connection
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const firebaseConfigValues: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Still read, might be used for RTDB
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Basic check for essential configuration keys for Firebase general setup
const requiredKeys: Array<keyof FirebaseConfig> = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  const value = firebaseConfigValues[key];
  // Dynamically create the expected environment variable name for the error message
  const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
  
  if (!value || value.startsWith('YOUR_') || value.startsWith('your_') || value.trim() === '') {
    const errorMessage = `Firebase configuration error: The environment variable ${envVarName} (for Firebase config key '${key}') in your .env file appears to be missing, empty, or is still using a placeholder value (e.g., "YOUR_..."). ` +
      `The current value found is "${value}". ` +
      `You MUST update this in your .env file with your actual Firebase project credential. ` +
      `After updating your .env file, remember to RESTART your development server.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Note: The specific check for databaseURL format for Realtime Database is kept here
// in case Realtime Database is used for other features. If it's not, this can be removed.
if (firebaseConfigValues.databaseURL && firebaseConfigValues.databaseURL !== "YOUR_DATABASE_URL" && !(firebaseConfigValues.databaseURL.startsWith('https://') && (firebaseConfigValues.databaseURL.endsWith('.firebaseio.com') || firebaseConfigValues.databaseURL.endsWith('.firebasedatabase.app')))) {
    const errorMessage = `Firebase Realtime Database URL configuration error (if used): The NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${firebaseConfigValues.databaseURL}") in your .env file is not a valid Firebase Realtime Database URL. ` +
      `It MUST start with "https://" and end with ".firebaseio.com" or ".firebasedatabase.app". ` +
      `Please correct this in your .env file and RESTART your development server if you intend to use Realtime Database.`;
    console.warn(errorMessage); // Changed to warn as Firestore is primary
}


// Cast to Required after checks, Firebase SDK will do more thorough validation
const firebaseConfig = firebaseConfigValues as Required<FirebaseConfig>;

let app: FirebaseApp;
let db: Firestore; // Changed db to be Firestore type

// Initialize Firebase App
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase initialization error (initializeApp call):", error.message);
    let detailedMessage = `Failed to initialize Firebase app. Original error: ${error.message}.`;
    if (error.message.includes("Invalid Firebase config")) {
      detailedMessage += " This often means some essential Firebase config values (apiKey, projectId, etc.) are missing or incorrect in your .env file, or were not loaded correctly (ensure server restart after .env changes).";
    }
    throw new Error(detailedMessage);
  }
} else {
  app = getApps()[0]; // Use the existing app
}

// Get Firestore instance
try {
  db = getFirestore(app);
} catch (error: any) {
  console.error("Firebase getFirestore error:", error.message);
  throw new Error(`Failed to get Firebase Firestore instance. Original error: ${error.message}. Ensure Firestore is enabled in your Firebase project and that your project configuration is correct.`);
}

export { app, db }; // db now exports the Firestore instance

    