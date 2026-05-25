import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // Define Stripe Client - it throws an error on use if STRIPE_SECRET_KEY is not available
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      if (!process.env.STRIPE_SECRET_KEY) {
         throw new Error('STRIPE_SECRET_KEY environment variable is required');
      }
      stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
        // @ts-ignore
        apiVersion: '2023-10-16', // using recent API version
      });
    }
    return stripeClient;
  };

  // Create a payment intent API
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'inr' } = req.body;
      const stripe = getStripe();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to paise/cents
        currency,
        payment_method_types: ['card', 'upi'], // Important: add 'upi' here for Indian accounts
        description: 'Vibe Fit Gym Premium Class Booking',
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e: any) {
      console.error(e);
      res.status(400).json({ error: e.message || 'Error creating payment intent' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Use *all to handle SPA routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
