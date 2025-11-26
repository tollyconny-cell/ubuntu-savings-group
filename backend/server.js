// server.js - Node/Express server for Stripe + Yoco payment endpoints (Ubuntu Savings Group)
const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_replace_with_yours');

app.use(cors());
app.use(express.json());

// ======== IN-MEMORY MOCK DB ========
let groups = [
  { id: 1, name: "Ukhanyo Stokvel", members: 12, balance: 5200 },
  { id: 2, name: "Sisonke Savings", members: 8, balance: 2300 }
];

let transactions = [];

// ======== CREATE STRIPE CHECKOUT SESSION ========
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, amount, description } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: {
        currency: 'zar',
        product_data: { name: description || 'Ubuntu Savings Group payment' },
        unit_amount: amount || 1000,
      }, quantity: 1 }],
      success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create Stripe checkout session' });
  }
});

// ======== CREATE PAYMENT INTENT ========
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'zar' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ======== STRIPE WEBHOOK ========
// Note: For signature verification to work, you must set STRIPE_WEBHOOK_SECRET to the value from Stripe Dashboard
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_replace_with_yours';

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment completed for session:', session.id);
      const amountPaid = (session.amount_total || 0) / 100; // Stripe returns in cents
      const newTx = {
        id: transactions.length + 1,
        group: 'Ukhanyo Stokvel',
        member: session.customer_email || 'Anonymous',
        amount: amountPaid,
        method: 'Card',
        date: new Date().toISOString().slice(0, 10),
      };
      transactions.push(newTx);
      groups = groups.map(g => g.name === 'Ukhanyo Stokvel' ? { ...g, balance: g.balance + amountPaid } : g);
      console.log('Updated groups and transactions:', groups, transactions);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// ======== YOCO PLACEHOLDER ========
app.post('/api/yoco-pay', (req, res) => {
  const { amount } = req.body;
  console.log(`Received Yoco payment request for amount R${amount}`);
  const newTx = {
    id: transactions.length + 1,
    group: 'Ukhanyo Stokvel',
    member: 'Yoco User',
    amount,
    method: 'Yoco',
    date: new Date().toISOString().slice(0, 10),
  };
  transactions.push(newTx);
  groups = groups.map(g => g.name === 'Ukhanyo Stokvel' ? { ...g, balance: g.balance + amount } : g);

  res.json({ success: true, message: `Yoco payment of R${amount} recorded`, transactions, groups });
});

// ======== DASHBOARD DATA (for frontend polling) ========
app.get('/api/dashboard', (req, res) => {
  res.json({ transactions, groups });
});

// ======== START SERVER ========
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
