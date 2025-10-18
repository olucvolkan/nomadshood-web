import type { NewsletterFormData, NewsletterSubscription } from '@/types';
import { supabase } from './supabase';

/**
 * Subscribes an email to the newsletter
 * SPAIN-ONLY: Automatically sets countries to ['Spain']
 */
export async function subscribeEmail(data: NewsletterFormData): Promise<string> {
  try {
    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('mail_subscriber')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existing && !checkError) {
      throw new Error('Email already subscribed to newsletter');
    }

    // Force Spain for country selection
    const subscription = {
      email: data.email,
      countries: ['Spain'], // Hardcoded to Spain only
      language: data.language || 'en',
      active: false,
      payment_status: 'pending',
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('mail_subscriber')
      .insert(subscription)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error subscribing to newsletter:', insertError);
      throw new Error('Failed to subscribe to newsletter');
    }

    return insertedData.id;
  } catch (error) {
    console.error('Error in subscribeEmail:', error);
    throw error;
  }
}

/**
 * Checks if an email already exists in the subscriber list
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('mail_subscriber')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkEmailExists:', error);
    return false;
  }
}

/**
 * Fetches all newsletter subscribers
 */
export async function getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('mail_subscriber')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      email: row.email,
      countries: row.countries,
      language: row.language,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      paymentStatus: row.payment_status as 'pending' | 'completed' | 'failed',
      paymentId: row.payment_id,
      active: row.active,
    }));
  } catch (error) {
    console.error('Error in getNewsletterSubscribers:', error);
    return [];
  }
}
