// Payment Service
// This file contains API calls to your backend for payment processing

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export interface CreatePaymentIntentResponse {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
}

/**
 * Creates a payment intent on your backend
 *
 * TODO: Implement your backend endpoint at /create-payment-intent
 *
 * Your backend should:
 * 1. Create a Stripe PaymentIntent with the amount
 * 2. Return the client secret to complete the payment
 *
 * Example backend code (Node.js/Express):
 *
 * app.post('/create-payment-intent', async (req, res) => {
 *   const { amount } = req.body;
 *
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: amount,
 *     currency: 'usd',
 *     automatic_payment_methods: {
 *       enabled: true,
 *     },
 *   });
 *
 *   res.json({
 *     paymentIntent: paymentIntent.client_secret,
 *   });
 * });
 */
export async function createPaymentIntent(amount: number): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Payment intent error:', errorData);
      throw new Error(errorData.error || `Failed to create payment intent: ${response.status}`);
    }

    const data = await response.json();
    return data.paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Confirms a successful payment on your backend
 * This is optional but recommended for recording the donation
 */
export async function confirmPayment(paymentIntentId: string, amount: number) {
  try {
    const response = await fetch(`${BACKEND_URL}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}
