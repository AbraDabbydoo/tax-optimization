# Stripe Payment Integration Setup

This guide covers setting up Stripe payment processing for the Tax Optimization application.

## Prerequisites

- Node.js 18+
- A Stripe account (free to create)

## 1. Create a Stripe Account

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up for a free account
3. Complete the account verification (business info can be added later)

## 2. Get Your API Keys

1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **test mode** keys:
   - `Publishable key` (starts with `pk_test_`)
   - `Secret key` (starts with `sk_test_`)

> ⚠️ **Important**: Never commit your secret key to version control!

## 3. Create a Product and Price

1. In the Stripe Dashboard, go to **Products** → **Add product**
2. Create a product:
   - **Name**: Tax Optimization Report
   - **Description**: Comprehensive multi-state tax comparison and optimization report
   - **Price**: $99.00 (one-time)
3. After creating, click on the product and copy the **Price ID** (starts with `price_`)

## 4. Configure Environment Variables

Update your `.env.local` file with your Stripe credentials:

```env
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Product Price ID
STRIPE_PRICE_ID=price_your_price_id_here

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 5. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the payment page: `http://localhost:3000/calculator/payment`

3. Click "Pay with Stripe" to test the checkout flow

4. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Any future expiry date and any CVC

## Project Structure

```
├── lib/
│   └── stripe.ts              # Stripe client configuration
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts       # Creates checkout sessions
│   │   └── verify-payment/
│   │       └── route.ts       # Verifies payment status
│   └── calculator/
│       └── payment/
│           └── page.tsx       # Payment page UI
└── .env.local                 # Environment variables (not committed)
```

## API Endpoints

### POST `/api/checkout`

Creates a Stripe Checkout session.

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

### GET `/api/verify-payment?session_id=cs_xxx`

Verifies a payment session.

**Response:**
```json
{
  "paid": true,
  "session": { ... }
}
```

## Going Live

When ready for production:

1. Complete Stripe account verification (typically 1-3 days)
2. Switch to **live mode** API keys in the Stripe Dashboard
3. Create a live product/price
4. Update `.env.local` with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_PRICE_ID=price_live_...
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

## Webhooks (Optional - For Production)

For production, set up webhooks to handle payment events reliably:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add an endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook signing secret

Then create `app/api/webhooks/stripe/route.ts` to handle events.

## Troubleshooting

### "Invalid API Key"
- Ensure keys are correctly copied (no extra spaces)
- Check you're using test keys in development

### Redirect Issues
- Verify `NEXT_PUBLIC_BASE_URL` matches your development URL
- Check browser console for CORS errors

### Payment Not Completing
- Use Stripe's test card numbers
- Check Stripe Dashboard → Payments for error details

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/checkout/quickstart)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)
- [Stripe Dashboard](https://dashboard.stripe.com)
