import { createApp } from '../src/app';
import { connectToDatabase } from '../src/config/db';

const app = createApp();

// Ensure database is connected before handling the request
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Vercel DB connection error:', error);
  }
  next();
});

// Vercel serverless functions require the express app to be exported!
export default app;
