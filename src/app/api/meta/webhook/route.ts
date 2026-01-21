import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// The Verify Token you provided in your Meta App Dashboard.
// It's a secret shared between Meta and your application.
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

/**
 * Handles GET requests for Meta webhook verification.
 * Meta sends a GET request to this endpoint to verify the callback URL.
 * See: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[Meta Webhook] Received verification request:', { mode, token, challenge });

  // Check if the verify token is set in the environment variables.
  if (!META_VERIFY_TOKEN) {
    console.error('[Meta Webhook] META_VERIFY_TOKEN is not set in environment variables.');
    return new NextResponse('Internal Server Error: Verify token not configured.', { status: 500 });
  }

  // Check the mode and token sent by Meta
  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    // Respond with the challenge token from the request
    console.log('[Meta Webhook] Verification successful. Responding with challenge.');
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    console.warn('[Meta Webhook] Verification failed. Tokens do not match.');
    return new NextResponse('Forbidden: Invalid verify token.', { status: 403 });
  }
}

/**
 * Handles POST requests which are the actual webhook events from Meta.
 * See: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#event-notifications
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // It's good practice to log the object type and entry ID for debugging,
  // but avoid logging the full body in production if it contains sensitive user data.
  console.log('[Meta Webhook] Received event:', {
    object: body.object,
    entryCount: body.entry?.length
  });

  // Optional: Store the raw event in Firestore for later processing or debugging.
  // This is wrapped in a try/catch to ensure the endpoint always returns a 200 OK
  // even if Firestore is unavailable or fails. Meta will retry if it doesn't get a 200.
  try {
    // Use a unique identifier from the header if available, otherwise generate one.
    const eventId = request.headers.get('x-hub-signature-256') || `event-${Date.now()}`;
    const webhookEventRef = db.collection('metaWebhookEvents').doc(eventId);
    await webhookEventRef.set({
      payload: body,
      receivedAt: Timestamp.now(),
      status: 'received',
    });
     console.log(`[Meta Webhook] Event stored in Firestore with ID: ${eventId}`);
  } catch (error) {
    console.error('[Meta Webhook] Failed to store event in Firestore:', error);
    // Do not re-throw. The most important thing is to acknowledge the event to Meta.
  }

  // Acknowledge the event with a 200 OK status.
  // This must be done quickly to prevent Meta from resending the event.
  return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
}
