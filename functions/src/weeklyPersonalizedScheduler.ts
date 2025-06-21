import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
  ColivingRecommendation,
  generatePersonalizedRecommendation,
  getAllSubscribers,
  selectColivingForSubscriber,
  sendBatchPersonalizedEmails,
  sendTestEmail,
  SubscriberData
} from './countryBasedColivingEmail';

// Load environment variables from .env file
dotenv.config();

/**
 * Scheduled function to send weekly personalized coliving emails
 * Runs every Monday at 10:00 AM UTC
 */
export const sendWeeklyPersonalizedEmails = functions.pubsub
  .schedule('0 10 * * 1') // Every Monday at 10:00 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting weekly personalized coliving email campaign...');

    try {
      // Get all active subscribers with country preferences
      const subscribers = await getAllSubscribers();
      console.log(`Found ${subscribers.length} subscribers with country preferences`);

      if (subscribers.length === 0) {
        console.log('No active subscribers with country preferences found');
        await logCampaignRun({
          subscribersProcessed: 0,
          emailsSent: 0,
          emailsFailed: 0,
          status: 'completed_no_subscribers'
        });
        return;
      }

      // Process subscribers in batches to avoid timeouts and rate limits
      const batchSize = 25; // Smaller batches for better error handling
      let totalEmailsSent = 0;
      let totalEmailsFailed = 0;
      let processedCount = 0;

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(subscribers.length/batchSize)}`);
        
        // Prepare email data for batch
        const emailData: Array<{ subscriber: SubscriberData; recommendation: ColivingRecommendation }> = [];
        
        // Process each subscriber in the batch
        for (const subscriber of batch) {
          try {
            console.log(`Processing subscriber: ${subscriber.email} (countries: ${subscriber.countries.join(', ')})`);

            // Select a coliving from one of subscriber's preferred countries
            const colivingId = await selectColivingForSubscriber(subscriber);
            if (!colivingId) {
              console.log(`No suitable coliving found for ${subscriber.email}`);
              await logProcessingFailure(subscriber.email, 'No suitable coliving found', 'coliving_selection');
              totalEmailsFailed++;
              processedCount++;
              continue;
            }

            // Generate personalized recommendation
            const recommendation = await generatePersonalizedRecommendation(subscriber, colivingId);
            if (!recommendation) {
              console.log(`Failed to generate recommendation for ${subscriber.email}`);
              await logProcessingFailure(subscriber.email, 'Failed to generate recommendation', 'recommendation_generation');
              totalEmailsFailed++;
              processedCount++;
              continue;
            }

            emailData.push({ subscriber, recommendation });
            processedCount++;

          } catch (error) {
            console.error(`Error processing subscriber ${subscriber.email}:`, error);
            await logProcessingFailure(
              subscriber.email, 
              error instanceof Error ? error.message : 'Unknown error', 
              'processing_error'
            );
            totalEmailsFailed++;
            processedCount++;
          }
        }

        // Send batch emails using Resend
        if (emailData.length > 0) {
          const batchResults = await sendBatchPersonalizedEmails(emailData);
          totalEmailsSent += batchResults.totalSent;
          totalEmailsFailed += batchResults.totalFailed;

          // Log individual email results
          for (const result of batchResults.results) {
            if (result.success) {
              const emailItem = emailData.find(item => item.subscriber.email === result.email);
              if (emailItem) {
                await logEmailSuccess(result.email, emailItem.recommendation.coliving.id, emailItem.recommendation.selectedCountry);
              }
            } else {
              await logEmailFailure(result.email, result.error || 'Unknown error', 'personalized');
            }
          }
        }

        // Add delay between batches to respect rate limits
        if (i + batchSize < subscribers.length) {
          console.log('Waiting 3 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }
      }

      console.log(`Personalized email campaign completed. Processed: ${processedCount}, Sent: ${totalEmailsSent}, Failed: ${totalEmailsFailed}`);

      // Log the campaign run
      await logCampaignRun({
        subscribersProcessed: processedCount,
        emailsSent: totalEmailsSent,
        emailsFailed: totalEmailsFailed,
        status: totalEmailsFailed === 0 ? 'completed_success' : 'completed_with_errors'
      });

    } catch (error) {
      console.error('Error in weekly personalized email campaign:', error);
      await logCampaignFailure(error instanceof Error ? error.message : 'Unknown error', 'general_error');
    }
  });

/**
 * Manual trigger for testing personalized emails
 */
export const triggerPersonalizedEmails = functions.https.onCall(async (data, context) => {
  // Verify admin authentication if needed
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to trigger personalized emails');
  }

  console.log('Manual personalized email trigger initiated by:', context.auth.uid);

  try {
    const testMode = data.testMode || false;
    const testEmail = data.testEmail;
    const limitCount = data.limit || 5; // Default to 5 for testing

    // Get subscribers (limited for testing)
    const allSubscribers = await getAllSubscribers();
    const subscribers = allSubscribers.slice(0, limitCount);
    
    console.log(`Manual trigger: Processing ${subscribers.length} subscribers (testMode: ${testMode})`);

    if (subscribers.length === 0) {
      return { success: false, message: 'No subscribers found' };
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const subscriber of subscribers) {
      try {
        // Select coliving and generate recommendation
        const colivingId = await selectColivingForSubscriber(subscriber);
        if (!colivingId) {
          emailsFailed++;
          continue;
        }

        const recommendation = await generatePersonalizedRecommendation(subscriber, colivingId);
        if (!recommendation) {
          emailsFailed++;
          continue;
        }

        // Send email (test or real)
        if (testMode && testEmail) {
          const result = await sendTestEmail(testEmail, subscriber, recommendation);
          if (result.success) {
            emailsSent++;
          } else {
            emailsFailed++;
          }
        } else {
          const emailData = [{ subscriber, recommendation }];
          const result = await sendBatchPersonalizedEmails(emailData);
          emailsSent += result.totalSent;
          emailsFailed += result.totalFailed;
        }

      } catch (error) {
        console.error(`Error in manual trigger for ${subscriber.email}:`, error);
        emailsFailed++;
      }
    }

    const result = {
      success: true,
      message: `Manual trigger completed. Sent: ${emailsSent}, Failed: ${emailsFailed}`,
      emailsSent,
      emailsFailed,
      testMode,
      subscribersProcessed: subscribers.length
    };

    console.log('Manual trigger result:', result);
    return result;

  } catch (error) {
    console.error('Error in manual personalized email trigger:', error);
    throw new functions.https.HttpsError('internal', 'Failed to trigger personalized emails');
  }
});

/**
 * Log campaign run statistics
 */
async function logCampaignRun(runData: {
  subscribersProcessed: number;
  emailsSent: number;
  emailsFailed: number;
  status: string;
}): Promise<void> {
  const db = admin.firestore();
  
  try {
    await db.collection('personalized_campaign_runs').add({
      ...runData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      runType: 'weekly_automated'
    });
  } catch (error) {
    console.error('Error logging campaign run:', error);
  }
}

/**
 * Log campaign failures
 */
async function logCampaignFailure(errorMessage: string, errorType: string): Promise<void> {
  const db = admin.firestore();
  
  try {
    await db.collection('personalized_campaign_failures').add({
      errorMessage,
      errorType,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging campaign failure:', error);
  }
}

/**
 * Log individual subscriber processing failures
 */
async function logProcessingFailure(email: string, errorMessage: string, errorType: string): Promise<void> {
  const db = admin.firestore();
  
  try {
    await db.collection('subscriber_processing_failures').add({
      email,
      errorMessage,
      errorType,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging processing failure:', error);
  }
}

/**
 * Log successful email sends
 */
async function logEmailSuccess(email: string, colivingId: string, country: string): Promise<void> {
  const db = admin.firestore();
  
  try {
    await db.collection('personalized_email_success').add({
      email,
      colivingId,
      country,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging email success:', error);
  }
}

/**
 * Log individual email failures
 */
async function logEmailFailure(email: string, errorMessage: string, emailType: string, colivingId?: string): Promise<void> {
  const db = admin.firestore();
  
  try {
    await db.collection('email_failures').add({
      email,
      errorMessage,
      emailType,
      colivingId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging email failure:', error);
  }
} 