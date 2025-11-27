# Stripe Payment Integration Setup Guide

This guide will help you complete the Stripe payment setup for the donation feature.

## What's Already Implemented

✅ Stripe React Native SDK installed and configured
✅ Stripe Provider added to the app
✅ Donation screen with amount selection UI
✅ Payment flow implementation with payment sheet
✅ Placeholder configuration files

## What You Need to Do

### 1. Get Stripe API Keys

1. Create a Stripe account at https://dashboard.stripe.com/register
2. Navigate to https://dashboard.stripe.com/apikeys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 2. Configure Your API Keys

#### Option A: Using Environment Variables (Recommended)

Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

#### Option B: Direct Configuration

Edit `config/stripe.ts` and replace the placeholder:

```typescript
export const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_ACTUAL_KEY_HERE";
```

**⚠️ IMPORTANT**: Never commit your secret key to version control!

### 3. Set Up Your Backend

You need a backend server to create payment intents securely. Here's a simple Node.js/Express example:

#### Install Dependencies

```bash
npm install express stripe cors
```

#### Create Backend Server (server.js)

```javascript
const express = require("express");
const stripe = require("stripe")("sk_test_YOUR_SECRET_KEY_HERE");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create payment intent endpoint
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        app: "DormDeal",
        type: "donation",
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Optional: Confirm payment endpoint
app.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    // You can add custom logic here, like:
    // - Saving donation to database
    // - Sending thank you email
    // - Updating user profile

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Run Your Backend

```bash
node server.js
```

### 4. Configure Backend URL

Update `services/paymentService.ts` with your backend URL:

```typescript
const BACKEND_URL = "http://YOUR_SERVER_IP:3000";
// For local development:
// - iOS Simulator: 'http://localhost:3000'
// - Android Emulator: 'http://10.0.2.2:3000'
// - Physical device: 'http://YOUR_COMPUTER_IP:3000'
```

Or use an environment variable:

```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_SERVER_IP:3000
```

### 5. Configure Apple Pay (iOS)

1. Get an Apple Merchant ID from https://developer.apple.com/account/resources/identifiers/list/merchant
2. Update `app.json` with your merchant ID (already added as placeholder):
   ```json
   "merchantIdentifier": "merchant.com.elitemicah.dormdeal"
   ```
3. Enable Apple Pay in your Stripe dashboard
4. Configure your merchant identifier in Stripe settings

### 6. Rebuild Your App

After configuration, rebuild your app:

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## Testing

### Test Cards

Use Stripe's test cards for testing:

- **Success**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

Use any future expiration date, any 3-digit CVC, and any postal code.

### Test Mode vs Live Mode

- Start with **test mode** (keys starting with `pk_test_` and `sk_test_`)
- When ready for production, switch to **live mode** keys (`pk_live_` and `sk_live_`)

## Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Set up webhook endpoints for payment events
- [ ] Implement proper error logging
- [ ] Add payment receipt emails
- [ ] Store donation records in database
- [ ] Set up Stripe webhook for payment confirmations
- [ ] Implement refund handling
- [ ] Add terms of service and privacy policy links
- [ ] Test thoroughly with real (small amount) payments
- [ ] Enable 3D Secure for additional security

## File Structure

```
DormDeal/
├── app/
│   ├── _layout.tsx                 # StripeProvider configured here
│   └── (tabs)/(home)/
│       └── donateScreen.tsx        # Donation UI and payment flow
├── config/
│   └── stripe.ts                   # Stripe configuration
├── services/
│   └── paymentService.ts           # Backend API calls
└── STRIPE_SETUP.md                 # This file
```

## Troubleshooting

### "Could not connect to payment server"

- Ensure your backend is running
- Check the BACKEND_URL in `paymentService.ts`
- Verify your device can reach the backend (use correct IP for physical devices)

### "Invalid publishable key"

- Verify your publishable key starts with `pk_test_` or `pk_live_`
- Check for extra spaces or quotes in the key
- Ensure the key is properly set in `config/stripe.ts`

### Payment sheet doesn't appear

- Check console for errors
- Verify initPaymentSheet completed successfully
- Ensure you're using a valid payment intent client secret

## Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe React Native Docs](https://docs.stripe.com/payments/accept-a-payment?platform=react-native)
- [Expo Stripe Integration](https://docs.expo.dev/versions/latest/sdk/stripe/)
- [Stripe Test Cards](https://stripe.com/docs/testing)

## Support

If you encounter issues, check:

1. Expo and React Native console logs
2. Your backend server logs
3. Stripe dashboard logs
4. Network requests in development tools
