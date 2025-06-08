import { db } from '@/lib/firebase';
import type { NewsletterFormData, NewsletterSubscription } from '@/types';
import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';

const COLLECTION_NAME = 'mail_subscriber';

export async function subscribeToNewsletter(data: NewsletterFormData): Promise<string> {
  try {
    // Check if email already exists
    const q = query(collection(db, COLLECTION_NAME), where('email', '==', data.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Email already subscribed to newsletter');
    }

    // Create subscription document
    const subscription: NewsletterSubscription = {
      email: data.email,
      countries: data.countries,
      createdAt: new Date(),
      paymentStatus: 'pending',
      active: false
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...subscription,
      createdAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const subscribers: NewsletterSubscription[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      subscribers.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      } as NewsletterSubscription);
    });

    return subscribers;
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return [];
  }
} 