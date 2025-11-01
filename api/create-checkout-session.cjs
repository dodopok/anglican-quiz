const Stripe = require('stripe');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    const { amount } = req.body;

    // Validar o valor (mínimo $1, máximo $100)
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Buy me a coffee ☕',
              description: 'Thank you for supporting the Anglican Quiz!',
            },
            unit_amount: parsedAmount * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://anglican-quiz.vercel.app'}?coffee=success`,
      cancel_url: `${req.headers.origin || 'https://anglican-quiz.vercel.app'}?coffee=canceled`,
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
