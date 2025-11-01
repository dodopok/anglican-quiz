import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react(),
        {
          name: 'api-server',
          configureServer(server) {
            server.middlewares.use('/api/create-checkout-session', async (req, res, next) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                try {
                  const Stripe = await import('stripe');
                  const stripe = new Stripe.default(env.STRIPE_SECRET_KEY, {
                    apiVersion: '2024-11-20.acacia',
                  });

                  const { amount } = JSON.parse(body);
                  const parsedAmount = parseInt(amount);

                  if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 100) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Invalid amount' }));
                    return;
                  }

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
                          unit_amount: parsedAmount * 100,
                        },
                        quantity: 1,
                      },
                    ],
                    mode: 'payment',
                    success_url: `http://localhost:3000?coffee=success`,
                    cancel_url: `http://localhost:3000?coffee=canceled`,
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify({ sessionId: session.id, url: session.url }));
                } catch (error: any) {
                  console.error('Error:', error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }
              });
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
