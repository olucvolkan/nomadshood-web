// Migrated to Supabase - Newsletter subscriptions
import { checkEmailExists as apiCheckEmailExists, getNewsletterSubscribers as apiGetNewsletterSubscribers, subscribeEmail } from '@/api/newsletter';
import type { NewsletterFormData, NewsletterSubscription } from '@/types';

/**
 * Subscribes an email to the newsletter
 * SPAIN-ONLY: Countries automatically set to ['Spain']
 */
export async function subscribeToNewsletter(data: NewsletterFormData): Promise<string> {
  return await subscribeEmail(data);
}

/**
 * Checks if an email already exists in the subscriber list
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  return await apiCheckEmailExists(email);
}

/**
 * Fetches all newsletter subscribers
 */
export async function getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
  return await apiGetNewsletterSubscribers();
}
